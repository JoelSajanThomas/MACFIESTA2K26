from rest_framework import serializers
from .models import Hostel, AccommodationBooking


class HostelSerializer(serializers.ModelSerializer):
    amenities_list = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()

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
            "is_full",
            "description",
            "is_active",
            "order",
        ]

    def get_amenities_list(self, obj):
        if not obj.amenities:
            return []
        return [a.strip() for a in obj.amenities.split(",") if a.strip()]

    def get_is_full(self, obj):
        return obj.is_full()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["available_beds"] = instance.beds_remaining()
        data["is_full"] = instance.is_full()
        return data


class AccommodationBookingSerializer(serializers.ModelSerializer):
    hostel_name = serializers.ReadOnlyField(source="hostel.name")
    hostel_details = HostelSerializer(source="hostel", read_only=True)
    payment_proof_url = serializers.SerializerMethodField()
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
            "include_breakfast",
            "include_lunch",
            "include_dinner",
            "special_requests",
            "payment_status",
            "payment_amount",
            "payment_method",
            "payment_transaction_id",
            "payment_proof",
            "payment_proof_url",
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
            "payment_status",
            "allocated_hostel",
            "allocated_room",
            "admin_notes",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        if "hostel" not in attrs and not self.instance:
            raise serializers.ValidationError({"hostel": "Please select a valid hostel."})
        check_in = attrs.get("check_in_date") or (self.instance.check_in_date if self.instance else None)
        check_out = attrs.get("check_out_date") or (self.instance.check_out_date if self.instance else None)
        if check_in and check_out and check_out < check_in:
            raise serializers.ValidationError({"check_out_date": "Check-out date cannot be earlier than check-in date."})
        persons = attrs.get("persons_count")
        if persons is not None and persons < 1:
            raise serializers.ValidationError({"persons_count": "Persons count must be at least 1."})
        phone = attrs.get("phone")
        if phone:
            from config.validators import validate_phone_number
            try:
                validate_phone_number(phone)
            except Exception as e:
                raise serializers.ValidationError({"phone": str(e)})

        if not self.instance:
            hostel = attrs.get("hostel")
            heads = attrs.get("persons_count") or 1
            if hostel and hostel.beds_remaining() < heads:
                raise serializers.ValidationError({
                    "hostel": (
                        f"{hostel.name} is full. "
                        f"{hostel.beds_remaining()} bed(s) left, {heads} requested."
                    )
                })

        request = self.context.get("request")
        is_staff = bool(request and request.user and request.user.is_staff)
        if not self.instance and not is_staff:
            from django.conf import settings as dj_settings

            amount = attrs.get("payment_amount")
            if amount is None:
                amount = dj_settings.ACCOMMODATION_FEE_PER_PERSON
            proof = attrs.get("payment_proof")
            txn = (attrs.get("payment_transaction_id") or "").strip()
            if float(amount or 0) > 0:
                if not txn:
                    raise serializers.ValidationError({
                        "payment_transaction_id": "Enter the UPI UTR / transaction ID."
                    })
                if not proof:
                    raise serializers.ValidationError({
                        "payment_proof": "Upload your hostel payment screenshot for finance verification."
                    })
            if proof:
                from django.core.exceptions import ValidationError as DjangoValidationError
                from config.validators import validate_uploaded_image
                try:
                    validate_uploaded_image(proof)
                except DjangoValidationError as exc:
                    msg = exc.messages[0] if getattr(exc, "messages", None) else "Invalid image file."
                    raise serializers.ValidationError({"payment_proof": msg}) from exc

        return super().validate(attrs)

    def get_payment_proof_url(self, obj):
        if not obj.payment_proof:
            return ""
        request = self.context.get("request")
        url = obj.payment_proof.url
        return request.build_absolute_uri(url) if request else url

    def create(self, validated_data):
        validated_data["status"] = "pending"
        validated_data["payment_status"] = "pending"
        return super().create(validated_data)


class AdminAccommodationBookingSerializer(serializers.ModelSerializer):
    hostel_name = serializers.ReadOnlyField(source="hostel.name")
    hostel_details = HostelSerializer(source="hostel", read_only=True)
    payment_proof_url = serializers.SerializerMethodField()

    class Meta:
        model = AccommodationBooking
        fields = "__all__"
        read_only_fields = ["id", "booking_id", "created_at", "updated_at"]

    def get_payment_proof_url(self, obj):
        if not obj.payment_proof:
            return ""
        request = self.context.get("request")
        url = obj.payment_proof.url
        return request.build_absolute_uri(url) if request else url

