from django.db import models


class Event(models.Model):
    CATEGORY_CHOICES = [
        ('tech', 'Tech'),
        ('arts', 'Arts'),
        ('sports', 'Sports'),
        ('management', 'Management'),
        ('general', 'General'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='general')
    description = models.TextField()
    rules = models.TextField(blank=True)
    venue = models.CharField(max_length=200)
    event_date = models.DateField()
    event_time = models.TimeField()
    max_participants = models.PositiveIntegerField(default=100)
    registration_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    image = models.ImageField(upload_to='events/', blank=True, null=True)
    is_registration_open = models.BooleanField(default=True)
    is_result_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def participant_count(self):
        return self.registrations.count()

    def __str__(self):
        return self.title