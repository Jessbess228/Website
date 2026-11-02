from django.contrib import admin

from dogs.models import Puppy


@admin.register(Puppy)
class PuppyAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "size", "breed_group", "age", "updated_at")
    search_fields = ("name", "temperament", "breed_group")
    list_filter = ("size", "breed_group")
