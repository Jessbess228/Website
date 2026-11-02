from django.core.management.base import BaseCommand

from dogs.services import fetch_and_upsert


class Command(BaseCommand):
    help = "Fetch dog profiles from The Dog API and upsert them via the ORM."

    def handle(self, *args, **options):
        count = fetch_and_upsert()
        self.stdout.write(self.style.SUCCESS(f"Upserted {count} puppy profiles."))
