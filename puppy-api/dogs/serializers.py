from rest_framework import serializers

from dogs.models import Puppy


class PuppySerializer(serializers.ModelSerializer):
    class Meta:
        model = Puppy
        fields = [
            "id",
            "name",
            "age",
            "size",
            "weight",
            "breed_group",
            "temperament",
            "first_photo_url",
            "updated_at",
        ]
