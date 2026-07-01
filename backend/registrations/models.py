from django.db import models
from django.contrib.auth.models import User
from events.models import Event


class Registration(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, related_name='registrations', on_delete=models.CASCADE)
    participant_name = models.CharField(max_length=150)
    college_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    payment_status = models.CharField(max_length=20, default='pending')
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'event')

    def __str__(self):
        return f"{self.participant_name} - {self.event.title}"