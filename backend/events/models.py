from django.db import models


class Event(models.Model):
    CATEGORY_CHOICES = [
        ('tech', 'Tech'),
        ('arts', 'Arts'),
        ('sports', 'Sports'),
        ('management', 'Management'),
        ('general', 'General'),
    ]

    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    AUDIENCE_CHOICES = [
        ('school', 'School Day'),
        ('college', 'College Day'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='general')
    audience = models.CharField(
        max_length=20,
        choices=AUDIENCE_CHOICES,
        blank=True,
        default='',
        help_text='School Day vs College Day audience. Blank for legacy/test events.',
    )
    department = models.CharField(
        max_length=120,
        blank=True,
        help_text='College zone (e.g. Tech Zone) or school classification (e.g. Major Attraction).',
    )
    description = models.TextField()
    rules = models.TextField(blank=True)
    venue = models.CharField(max_length=200, blank=True, default='')
    event_date = models.DateField()
    event_time = models.TimeField(
        null=True,
        blank=True,
        help_text='Start time. Leave blank when schedule is TBD / unscheduled.',
    )
    event_end_time = models.TimeField(
        null=True,
        blank=True,
        help_text='End time when officially scheduled.',
    )
    max_participants = models.PositiveIntegerField(default=100)
    min_team_size = models.PositiveIntegerField(null=True, blank=True)
    max_team_size = models.PositiveIntegerField(null=True, blank=True)
    registration_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    prize_pool = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Official prize pool in ₹. Leave blank when not announced.',
    )
    registration_deadline = models.DateTimeField(null=True, blank=True)
    coordinator_name = models.CharField(max_length=150, blank=True)
    coordinator_phone = models.CharField(max_length=20, blank=True)
    coordinator_email = models.EmailField(blank=True)
    image = models.ImageField(upload_to='events/', blank=True, null=True)
    banner_image = models.ImageField(upload_to='events/banners/', blank=True, null=True)
    poster_image = models.ImageField(upload_to='events/posters/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    is_registration_open = models.BooleanField(default=True)
    waiting_list_enabled = models.BooleanField(default=True)
    is_result_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def participant_count(self):
        return self.registrations.filter(is_waiting_list=False).count()

    def waiting_count(self):
        return self.registrations.filter(is_waiting_list=True).count()

    def __str__(self):
        return self.title
