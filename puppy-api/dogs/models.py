from django.db import models


class Puppy(models.Model):
    """Dog breed profile persisted from The Dog API."""

    id = models.BigIntegerField(primary_key=True)
    name = models.CharField(max_length=255)
    age = models.CharField(max_length=64, blank=True, default="n/a")
    size = models.CharField(max_length=32, blank=True, default="n/a")
    weight = models.CharField(max_length=128, blank=True, default="n/a")
    breed_group = models.CharField(max_length=128, blank=True, default="n/a")
    temperament = models.TextField(blank=True, default="n/a")
    first_photo_url = models.CharField(max_length=500, blank=True, default="n/a")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "puppies"

    def __str__(self) -> str:
        return self.name
