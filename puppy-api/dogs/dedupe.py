"""Find and remove Puppy rows that share a breed name.

The Dog API /images/search returns different photos of the same breed,
each with its own image id. Upserting by that id used to create one
SQLite row per photo. These helpers treat the breed name (case-insensitive)
as the identity instead.
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass

from dogs.models import Puppy


def name_key(name: str) -> str:
    """Case-insensitive identity for a breed name. Empty / n/a collapse together."""
    cleaned = (name or "").strip().casefold()
    return "" if cleaned in {"", "n/a"} else cleaned


def has_photo(puppy: Puppy) -> bool:
    url = (puppy.first_photo_url or "").strip().lower()
    return url not in {"", "n/a"}


def prefer_puppy(left: Puppy, right: Puppy) -> Puppy:
    """Keep the row with a photo, else the newer one, else the lower id."""
    left_photo, right_photo = has_photo(left), has_photo(right)
    if left_photo != right_photo:
        return left if left_photo else right
    if left.updated_at != right.updated_at:
        return left if left.updated_at > right.updated_at else right
    return left if left.id <= right.id else right


def collapse_by_name(puppies: list[Puppy]) -> list[Puppy]:
    """One row per breed name, preserving name sort order."""
    chosen: dict[str, Puppy] = {}
    for puppy in puppies:
        key = name_key(puppy.name)
        existing = chosen.get(key)
        chosen[key] = puppy if existing is None else prefer_puppy(existing, puppy)
    return sorted(chosen.values(), key=lambda puppy: puppy.name.casefold())


@dataclass(frozen=True)
class DuplicateGroup:
    name: str
    keep: Puppy
    extras: list[Puppy]

    @property
    def ids(self) -> list[int]:
        return [self.keep.id, *[puppy.id for puppy in self.extras]]


def find_duplicate_groups() -> list[DuplicateGroup]:
    """Group stored rows that share a breed name. Empty when names are unique."""
    buckets: dict[str, list[Puppy]] = defaultdict(list)
    for puppy in Puppy.objects.all():
        key = name_key(puppy.name)
        if key:
            buckets[key].append(puppy)

    groups: list[DuplicateGroup] = []
    for rows in buckets.values():
        if len(rows) < 2:
            continue
        keep = rows[0]
        for other in rows[1:]:
            keep = prefer_puppy(keep, other)
        extras = [row for row in rows if row.id != keep.id]
        groups.append(DuplicateGroup(name=keep.name, keep=keep, extras=extras))

    groups.sort(key=lambda group: group.name.casefold())
    return groups


def delete_duplicate_extras(groups: list[DuplicateGroup] | None = None) -> int:
    """Delete the extra rows in each duplicate group. Returns how many were removed."""
    if groups is None:
        groups = find_duplicate_groups()
    extra_ids = [puppy.id for group in groups for puppy in group.extras]
    if not extra_ids:
        return 0
    deleted, _ = Puppy.objects.filter(id__in=extra_ids).delete()
    return deleted
