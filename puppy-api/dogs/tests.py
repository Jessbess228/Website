from django.test import TestCase
from django.urls import reverse

from dogs.dedupe import collapse_by_name, find_duplicate_groups
from dogs.models import Puppy
from dogs.services import upsert_profiles


def _row(
    puppy_id: int,
    name: str,
    photo: str = "n/a",
    size: str = "Small",
) -> Puppy:
    return Puppy.objects.create(
        id=puppy_id,
        name=name,
        age="12 - 15",
        size=size,
        breed_group="Toy",
        first_photo_url=photo,
    )


class DedupeHelpersTests(TestCase):
    def test_find_duplicate_groups_keeps_the_photo_row(self):
        blank = _row(1, "Affenpinscher")
        pictured = _row(2, "affenpinscher", photo="https://cdn.example/dog.jpg")
        _row(3, "Beagle", photo="https://cdn.example/beagle.jpg")

        groups = find_duplicate_groups()
        self.assertEqual(len(groups), 1)
        self.assertEqual(groups[0].name, "affenpinscher")
        self.assertEqual(groups[0].keep.id, pictured.id)
        self.assertEqual([extra.id for extra in groups[0].extras], [blank.id])

    def test_collapse_by_name_returns_one_row_per_breed(self):
        first = _row(10, "Affenpinscher")
        _row(11, "Affenpinscher", photo="https://cdn.example/dog.jpg")
        beagle = _row(12, "Beagle")

        collapsed = collapse_by_name(list(Puppy.objects.all()))
        self.assertEqual([puppy.id for puppy in collapsed], [11, beagle.id])
        self.assertNotIn(first.id, [puppy.id for puppy in collapsed])


class UpsertByNameTests(TestCase):
    def test_second_photo_of_same_breed_updates_existing_row(self):
        upsert_profiles(
            [
                {
                    "id": 100,
                    "name": "Affenpinscher",
                    "age": "12 - 14 years",
                    "size": "Small",
                    "breeder": "Toy",
                    "temperament": "Alert",
                    "first_photo_url": "https://cdn.example/one.jpg",
                }
            ]
        )
        upsert_profiles(
            [
                {
                    "id": 200,
                    "name": "Affenpinscher",
                    "age": "12 - 14 years",
                    "size": "Small",
                    "breeder": "Toy",
                    "temperament": "Alert",
                    "first_photo_url": "https://cdn.example/two.jpg",
                }
            ]
        )

        self.assertEqual(Puppy.objects.count(), 1)
        puppy = Puppy.objects.get()
        self.assertEqual(puppy.id, 100)
        self.assertEqual(puppy.first_photo_url, "https://cdn.example/two.jpg")


class PuppyApiTests(TestCase):
    def test_list_hides_duplicate_names(self):
        _row(1, "Affenpinscher")
        _row(2, "Affenpinscher", photo="https://cdn.example/dog.jpg")
        _row(3, "Beagle")

        response = self.client.get(reverse("puppy-list"))
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["count"], 2)
        self.assertEqual(
            [row["name"] for row in body["results"]],
            ["Affenpinscher", "Beagle"],
        )
