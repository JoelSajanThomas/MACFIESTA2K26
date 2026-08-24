import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from events.models import Event

print("TOTAL EVENTS IN DJANGO DB:", Event.objects.count())
school_events = Event.objects.filter(audience='school')
college_events = Event.objects.filter(audience='college')
other_events = Event.objects.exclude(audience__in=['school', 'college'])

print(f"\n--- SCHOOL EVENTS ({school_events.count()}) ---")
for e in school_events:
    print(f"ID: {e.id} | Slug: {e.slug} | Fee: {e.registration_fee} | Title: {e.title}")

print(f"\n--- COLLEGE EVENTS ({college_events.count()}) ---")
for e in college_events:
    print(f"ID: {e.id} | Slug: {e.slug} | Fee: {e.registration_fee} | Title: {e.title}")

print(f"\n--- OTHER/UNTAGGED EVENTS ({other_events.count()}) ---")
for e in other_events:
    print(f"ID: {e.id} | Audience: '{e.audience}' | Slug: {e.slug} | Title: {e.title}")
