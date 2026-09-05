import uuid
from django.db import models
from django.contrib.auth.models import User


class Hostel(models.Model):
    GENDER_CHOICES = [
        ("male", "Mens Hostel"),
        ("female", "Ladies Hostel"),
        ("all", "All Delegates / Co-ed"),
    ]

    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150, unique=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default="male")
    hostel_type = models.CharField(max_length=100, default="Campus Hostel")
    location = models.CharField(max_length=200, default="MACFAST Campus")
    distance = models.CharField(max_length=100, default="2 min walk to Fest Arena")
    tariff_per_night = models.DecimalField(max_digits=8, decimal_places=2, default=350.00)
    room_types = models.CharField(max_length=255, default="Twin Sharing, 4-Sharing Dormitory")
    amenities = models.TextField(
        default="Free Wi-Fi, 24/7 Security & CCTV, Hot Water, Filter Drinking Water, Mess Breakfast Included"
    )
    warden_name = models.CharField(max_length=120)
    warden_phone = models.CharField(max_length=30)
    total_capacity = models.PositiveIntegerField(default=100)
    available_beds = models.PositiveIntegerField(default=50)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return f"{self.name} ({self.get_gender_display()})"


class AccommodationBooking(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending Allocation"),
        ("confirmed", "Confirmed"),
        ("allocated", "Allocated Room"),
        ("checked_in", "Checked In"),
        ("checked_out", "Checked Out"),
        ("cancelled", "Cancelled"),
    ]

    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    ]

    booking_id = models.CharField(max_length=32, unique=True, db_index=True)
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="accommodation_bookings"
    )
    hostel = models.ForeignKey(
        Hostel, on_delete=models.CASCADE, related_name="bookings"
    )
    full_name = models.CharField(max_length=150)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30)
    college = models.CharField(max_length=200)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default="male")
    persons_count = models.PositiveSmallIntegerField(default=1)
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    include_breakfast = models.BooleanField(default=False)
    include_lunch = models.BooleanField(default=False)
    include_dinner = models.BooleanField(default=False)
    special_requests = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    payment_status = models.CharField(max_length=20, default="pending")
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, default=350.0)
    payment_method = models.CharField(max_length=40, blank=True, default="upi_qr")
    payment_transaction_id = models.CharField(max_length=80, blank=True)
    payment_proof = models.ImageField(upload_to="accommodation/payment_proof/", blank=True, null=True)
    allocated_hostel = models.CharField(max_length=150, blank=True)
    allocated_room = models.CharField(max_length=60, blank=True)
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.booking_id:
            short_id = uuid.uuid4().hex[:6].upper()
            self.booking_id = f"HST-2026-{short_id}"
        if not self.allocated_hostel and self.hostel:
            self.allocated_hostel = self.hostel.name
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.booking_id}] {self.full_name} - {self.hostel.name} ({self.status})"
