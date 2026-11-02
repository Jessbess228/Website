"""Fetch from The Dog API and upsert into the Django ORM."""

from __future__ import annotations

import logging
from typing import Any

from django.conf import settings

from dogs.dedupe import name_key
from dogs.models import Puppy
from puppy_data.fetcher import fetch_puppy_profiles, save_data

logger = logging.getLogger(__name__)


def _display_value(value: Any) -> str:
    return value if (value is not None and str(value).strip() != "") else "n/a"


def _as_int_id(raw_id: Any) -> int | None:
    if isinstance(raw_id, int):
        return raw_id
    if isinstance(raw_id, str) and raw_id.isdigit():
        return int(raw_id)
    return None


def upsert_profiles(profiles: list[dict[str, Any]]) -> int:
    """Insert or update puppy rows keyed by breed name.

    The Dog API image id is unique per photo, not per breed, so matching on
    id created Affenpinscher × N. A later photo of the same name updates the
    existing row instead of inserting another.
    """
    count = 0
    for item in profiles:
        puppy_id = _as_int_id(item.get("id"))
        if puppy_id is None:
            logger.warning("Skipping profile without integer id: %s", item.get("name"))
            continue

        defaults = {
            "name": _display_value(item.get("name")),
            "age": _display_value(item.get("age")),
            "size": _display_value(item.get("size")),
            "weight": _display_value(item.get("weight")),
            "breed_group": _display_value(item.get("breeder")),
            "temperament": _display_value(item.get("temperament")),
            "first_photo_url": _display_value(item.get("first_photo_url")),
        }
        breed_key = name_key(defaults["name"])
        existing = (
            Puppy.objects.filter(name__iexact=defaults["name"]).first()
            if breed_key
            else None
        )

        if existing is not None:
            for field, value in defaults.items():
                setattr(existing, field, value)
            existing.save()
        else:
            Puppy.objects.update_or_create(id=puppy_id, defaults=defaults)
        count += 1

    logger.info("Upserted %s puppy profiles via Django ORM", count)
    return count


def fetch_and_upsert() -> int:
    """
    Hit The Dog API, save raw JSON for the CLI pipeline, and upsert into SQLite
    through the ORM so historical rows accumulate.
    """
    # Keep puppy_data.config.MAX_PUPPIES aligned with Django settings.
    import puppy_data.config as puppy_config

    puppy_config.MAX_PUPPIES = int(getattr(settings, "MAX_PUPPIES", 6))

    profiles = fetch_puppy_profiles()
    if profiles:
        save_data(profiles)
        return upsert_profiles(profiles)

    logger.warning("Dog API returned no profiles to upsert")
    return 0
