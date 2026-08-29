from rest_framework import serializers
from .models import Hostel, AccommodationBooking


class HostelSerializer(serializers.ModelSerializer):
    amenities_list = serializers.SerializerMethodField()

    class Meta:
        model = Hostel
        fields = [
            "id",
            "name",
            "slug",
            "gender",
            "hostel_type",
            "location",
            "distance",
            "tariff_per_night",
            "room_types",
            "amenities",
            "amenities_list",
            "warden_name",
            "warden_phone",
            "total_capacity",
            "available_beds",
            "description",
            "is_active",
            "order",
        ]

    def get_amenities_list(self, obj):
        if not obj.amenities:
            return []
        return [a.strip() for a in obj.amenities.split(",") if a.strip()]


class AccommodationBookingSerializer(serializers.ModelSerializer):
    hostel_name = serializers.ReadOnlyField(source="hostel.name")
    hostel_details = HostelSerializer(source="hostel", read_only=True)
    hostel = serializers.PrimaryKeyRelatedField(
        queryset=Hostel.objects.filter(is_active=True), required=False
    )
    hostel_id = serializers.PrimaryKeyRelatedField(
        queryset=Hostel.objects.filter(is_active=True), source="hostel", required=False, write_only=True
    )

    class Meta:
        model = AccommodationBooking
        fields = [
            "id",
            "booking_id",
            "user",
            "hostel",
            "hostel_id",
            "hostel_name",
            "hostel_details",
            "full_name",
            "email",
            "phone",
            "college",
            "gender",
            "persons_count",
            "check_in_date",
            "check_out_date",
            "special_requests",
            "status",
            "allocated_hostel",
            "allocated_room",
            "admin_notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "booking_id",
            "user",
            "status",
            "allocated_hostel",
            "allocated_room",
            "admin_notes",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        if "hostel" not in attrs and not self.instance:
            raise serializers.ValidationError({"hostel": "Please select a valid hostel."})
        return attrs


class AdminAccommodationBookingSerializer(serializers.ModelSerializer):
    hostel_name = serializers.ReadOnlyField(source="hostel.name")
    hostel_details = HostelSerializer(source="hostel", read_only=True)

    class Meta:
        model = AccommodationBooking
        fields = "__all__"
        read_only_fields = ["id", "booking_id", "created_at", "updated_at"]

