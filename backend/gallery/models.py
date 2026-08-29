from django.db import models


class GalleryImage(models.Model):
    TYPE_CHOICES = [
        ('image', 'Image / Photo'),
        ('video', 'Video / Reel'),
    ]

    CATEGORY_CHOICES = [
        ('general', 'General Festival Highlights'),
        ('cultural', 'Cultural & Pro-Show'),
        ('technical', 'Technical Competitions'),
        ('gaming', 'Esports & Gaming'),
        ('pro-show', 'Celebrity & Pro-Shows'),
    ]

    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='image')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    title = models.CharField(max_length=200)
    image = models.ImageField(upload_to='gallery/', blank=True, null=True)
    thumbnail = models.ImageField(upload_to='gallery/thumbs/', blank=True, null=True,
                                  help_text='Cover image for video items (optional)')
    video_url = models.CharField(max_length=500, blank=True, default='',
                                 help_text='YouTube URL / embed link or server file path for video type')
    featured = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f'[{self.type.upper()}] {self.title}'