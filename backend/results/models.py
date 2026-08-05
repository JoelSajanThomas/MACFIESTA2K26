from django.db import models
from events.models import Event


class Result(models.Model):
    POSITION_CHOICES = [
        ('first', 'First Prize'),
        ('second', 'Second Prize'),
        ('third', 'Third Prize'),
        ('special', 'Special Mention'),
    ]

    event = models.ForeignKey(Event, related_name='results', on_delete=models.CASCADE)
    participant_name = models.CharField(max_length=150)
    college_name = models.CharField(max_length=200)
    position = models.CharField(max_length=20, choices=POSITION_CHOICES)
    remarks = models.TextField(blank=True)
    winner_photo = models.ImageField(upload_to='results/', blank=True, null=True)

    def __str__(self):
        return f"{self.event.title} - {self.position}"