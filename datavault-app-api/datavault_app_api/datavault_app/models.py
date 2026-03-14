from django.db import models


class LocationPoint(models.Model):
    label = models.CharField(max_length=120)
    latitude = models.FloatField()
    longitude = models.FloatField()
    recorded_at = models.DateTimeField()

    class Meta:
        ordering = ["recorded_at"]

    def __str__(self):
        return f"{self.label} @ {self.recorded_at.isoformat()}"


class ChatMessage(models.Model):
    class Role(models.TextChoices):
        USER = "user", "User"
        ASSISTANT = "assistant", "Assistant"

    role = models.CharField(max_length=20, choices=Role.choices)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.role}: {self.content[:40]}"
