from rest_framework import serializers
from .models import Registration


class RegistrationSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)

    class Meta:
        model = Registration
        fields = '__all__'
        read_only_fields = ['user']

    def validate(self, attrs):
        request = self.context.get('request')
        event = attrs['event']

        if not event.is_registration_open:
            raise serializers.ValidationError(
                {'event': 'Registration is closed for this event.'}
            )

        if event.registrations.count() >= event.max_participants:
            raise serializers.ValidationError(
                {'event': 'This event is full.'}
            )

        if request and request.user.is_authenticated:
            if Registration.objects.filter(user=request.user, event=event).exists():
                raise serializers.ValidationError(
                    {'event': 'You are already registered for this event.'}
                )

        return attrs