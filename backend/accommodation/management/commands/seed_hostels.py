from django.core.management.base import BaseCommand

from accommodation.models import Hostel

HOSTELS = [
    {
        "slug": "st-thomas-mens-hostel",
        "name": "St. Thomas Mens Hostel",
        "gender": "male",
        "hostel_type": "Campus Mens Hostel",
        "location": "MACFAST Main Campus Block A",
        "distance": "2 min walk to Fest Arena",
        "room_types": "4-Sharing Dormitory, Twin Sharing Rooms",
        "warden_name": "Prof. Alexander Varghese",
        "warden_phone": "+91 94470 12345",
        "total_capacity": 50,
        "description": "On-campus mens hostel. Booking closes after 50 beds are taken.",
        "is_active": True,
        "order": 1,
    },
    {
        "slug": "st-teresa-ladies-hostel",
        "name": "St. Teresa Ladies Hostel",
        "gender": "female",
        "hostel_type": "Campus Ladies Hostel",
        "location": "Campus Block C (Secured Ladies Wing)",
        "distance": "2 min walk to Fest Arena",
        "room_types": "Twin Sharing, Triple Sharing Rooms",
        "warden_name": "Sr. Grace Mary",
        "warden_phone": "+91 94463 67890",
        "total_capacity": 50,
        "description": "On-campus ladies hostel. Booking closes after 50 beds are taken.",
        "is_active": True,
        "order": 2,
    },
]


class Command(BaseCommand):
    help = "Seed St. Thomas (50) and St. Teresa (50) hostels; close extra wings."

    def handle(self, *args, **options):
        for data in HOSTELS:
            slug = data["slug"]
            defaults = {**data, "available_beds": data["total_capacity"]}
            hostel = Hostel.objects.filter(name=data["name"]).first() or Hostel.objects.filter(slug=slug).first()
            if hostel:
                for key, value in defaults.items():
                    setattr(hostel, key, value)
                hostel.save()
                created = False
            else:
                hostel = Hostel.objects.create(**defaults)
                created = True
            hostel.sync_available_beds()
            self.stdout.write(self.style.SUCCESS(
                f"{'Created' if created else 'Updated'} {hostel.name}: "
                f"{hostel.beds_remaining()}/{hostel.total_capacity} beds free"
            ))

        extra = Hostel.objects.exclude(slug__in=[h["slug"] for h in HOSTELS])
        for hostel in extra:
            hostel.is_active = False
            hostel.save(update_fields=["is_active"])
            self.stdout.write(self.style.WARNING(f"Deactivated extra hostel: {hostel.name}"))
