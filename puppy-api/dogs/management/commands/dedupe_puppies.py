from django.core.management.base import BaseCommand

from dogs.dedupe import delete_duplicate_extras, find_duplicate_groups


class Command(BaseCommand):
    help = (
        "List Puppy rows that share a breed name. Pass --apply to delete the extras, "
        "keeping the row with a photo (then the newest)."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--apply",
            action="store_true",
            help="Delete extra rows. Without this flag the command only reports.",
        )

    def handle(self, *args, **options):
        groups = find_duplicate_groups()
        if not groups:
            self.stdout.write(self.style.SUCCESS("No duplicate breed names."))
            return

        extra_count = sum(len(group.extras) for group in groups)
        self.stdout.write(
            f"Found {len(groups)} duplicate name(s) ({extra_count} extra row(s)):"
        )
        for group in groups:
            extra_ids = ", ".join(str(puppy.id) for puppy in group.extras)
            self.stdout.write(
                f"  {group.name}: keep {group.keep.id}, remove {extra_ids}"
            )

        if not options["apply"]:
            self.stdout.write(
                self.style.WARNING("Dry run. Re-run with --apply to delete extras.")
            )
            return

        deleted = delete_duplicate_extras(groups)
        self.stdout.write(self.style.SUCCESS(f"Deleted {deleted} extra row(s)."))
