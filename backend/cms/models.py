from django.db import models


class SiteSetting(models.Model):
    fest_name = models.CharField(max_length=120, default="MacFiesta")
    fest_year = models.PositiveIntegerField(default=2026)
    tagline = models.CharField(max_length=200, default="Where Legends Rise")
    college_name = models.CharField(max_length=120, default="MACFAST")
    hero_title = models.CharField(max_length=200, blank=True)
    hero_subtitle = models.CharField(max_length=200, blank=True)
    hero_description = models.TextField(blank=True)
    fest_date = models.DateField(null=True, blank=True)
    venue = models.CharField(max_length=200, blank=True)
    location = models.CharField(max_length=200, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=30, blank=True)
    official_website = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    hero_image = models.ImageField(upload_to="cms/hero/", blank=True, null=True)
    about_image = models.ImageField(upload_to="cms/about/", blank=True, null=True)
    about_title = models.CharField(max_length=200, blank=True)
    about_body = models.TextField(blank=True)
    countdown_datetime = models.DateTimeField(null=True, blank=True)
    footer_copyright = models.CharField(max_length=300, blank=True)
    footer_tagline = models.CharField(max_length=200, blank=True)
    logo_image = models.ImageField(upload_to="cms/brand/", blank=True, null=True)
    terms_body = models.TextField(blank=True)
    privacy_body = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Site settings"
        verbose_name_plural = "Site settings"

    def __str__(self):
        return f"{self.fest_name} {self.fest_year}"


class FestivalHighlight(models.Model):
    icon = models.CharField(max_length=16, default="✨")
    title = models.CharField(max_length=120)
    description = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.title


class EventCategoryContent(models.Model):
    name = models.CharField(max_length=120)
    icon = models.CharField(max_length=16, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="cms/categories/", blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Event category content"
        verbose_name_plural = "Event category contents"

    def __str__(self):
        return self.name


class EventFormat(models.Model):
    label = models.CharField(max_length=8)
    title = models.CharField(max_length=80)
    description = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.title


class GuestProfile(models.Model):
    name = models.CharField(max_length=120)
    role = models.CharField(max_length=120)
    description = models.TextField()
    image = models.ImageField(upload_to="cms/guests/", blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.name


class ThemeSection(models.Model):
    eyebrow = models.CharField(max_length=120, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to="cms/theme/", blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Theme section"
        verbose_name_plural = "Theme sections"

    def __str__(self):
        return self.title


class Testimonial(models.Model):
    quote = models.TextField()
    name = models.CharField(max_length=120)
    role = models.CharField(max_length=120, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.name


class FAQ(models.Model):
    question = models.CharField(max_length=300)
    answer = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "FAQ"
        verbose_name_plural = "FAQs"

    def __str__(self):
        return self.question


class Sponsor(models.Model):
    SPONSOR_TYPES = [
        ("Host", "Host"),
        ("Title", "Title"),
        ("Gold", "Gold"),
        ("Silver", "Silver"),
        ("Partner", "Partner"),
        ("Media", "Media"),
    ]

    name = models.CharField(max_length=120)
    sponsor_type = models.CharField(max_length=20, choices=SPONSOR_TYPES, default="Partner")
    logo = models.ImageField(upload_to="cms/sponsors/", blank=True, null=True)
    website = models.URLField(blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.name


class HomepageSection(models.Model):
    SECTION_KEYS = [
        ("hero", "Hero"),
        ("live_updates", "Live Updates"),
        ("about", "About"),
        ("formats", "Event Formats"),
        ("highlights", "Highlights"),
        ("categories", "Categories"),
        ("theme", "Theme"),
        ("guests", "Guest Profiles"),
        ("rewind", "Fest Rewind"),
        ("featured_events", "Featured Events"),
        ("statistics", "Statistics"),
        ("winners", "Winners"),
        ("gallery", "Gallery"),
        ("announcements", "Announcements"),
        ("sponsors", "Sponsors"),
        ("testimonials", "Testimonials"),
        ("faq", "FAQ"),
        ("cta", "CTA Banner"),
    ]

    section_key = models.CharField(max_length=40, choices=SECTION_KEYS, unique=True)
    title = models.CharField(max_length=200, blank=True)
    subtitle = models.CharField(max_length=300, blank=True)
    is_visible = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "section_key"]

    def __str__(self):
        return self.get_section_key_display()


class FestRewindItem(models.Model):
    title = models.CharField(max_length=120)
    image = models.ImageField(upload_to="cms/rewind/", blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Fest rewind item"
        verbose_name_plural = "Fest rewind items"

    def __str__(self):
        return self.title
