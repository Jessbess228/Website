import re

from django.db.models import Q
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from dogs.dedupe import collapse_by_name
from dogs.models import Puppy
from dogs.serializers import PuppySerializer

_LIFESPAN_NUMBERS = re.compile(r"(\d+(?:\.\d+)?)")


def parse_lifespan(age: str) -> tuple[float, float] | None:
    """Parse values like '12-15' or '12 - 15 years' into (min, max) years."""
    if not age or age.strip().lower() in {"", "n/a"}:
        return None
    nums = [float(n) for n in _LIFESPAN_NUMBERS.findall(age)]
    if not nums:
        return None
    return min(nums), max(nums)


def _parse_optional_float(raw: str | None) -> float | None:
    if raw is None or not str(raw).strip():
        return None
    try:
        return float(raw)
    except ValueError:
        return None


class PuppyListView(APIView):
    """List / search puppy breed profiles stored in SQLite via the ORM."""

    authentication_classes: list = []
    permission_classes: list = []

    def get(self, request: Request) -> Response:
        qs = Puppy.objects.all()

        name = request.query_params.get("name", "").strip()
        size = request.query_params.get("size", "").strip()
        breed_group = request.query_params.get("breed_group", "").strip()
        q = request.query_params.get("q", "").strip()
        min_lifespan = _parse_optional_float(request.query_params.get("min_lifespan"))
        max_lifespan = _parse_optional_float(request.query_params.get("max_lifespan"))

        if name:
            qs = qs.filter(name__icontains=name)
        if size:
            qs = qs.filter(size__iexact=size)
        if breed_group:
            qs = qs.filter(breed_group__icontains=breed_group)
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(breed_group__icontains=q))

        puppies = list(qs)
        if min_lifespan is not None or max_lifespan is not None:
            low = min_lifespan if min_lifespan is not None else float("-inf")
            high = max_lifespan if max_lifespan is not None else float("inf")
            if low > high:
                low, high = high, low

            filtered = []
            for puppy in puppies:
                span = parse_lifespan(puppy.age)
                if span is None:
                    continue
                puppy_min, puppy_max = span
                # Keep breeds whose lifespan range overlaps the selected range.
                if puppy_min <= high and puppy_max >= low:
                    filtered.append(puppy)
            puppies = filtered

        # Hide leftover same-name rows until `dedupe_puppies --apply` runs.
        puppies = collapse_by_name(puppies)
        serializer = PuppySerializer(puppies, many=True)
        return Response({"count": len(puppies), "results": serializer.data})


class PuppyFiltersView(APIView):
    """Distinct filter values for the portfolio search UI."""

    authentication_classes: list = []
    permission_classes: list = []

    def get(self, _request: Request) -> Response:
        sizes = list(
            Puppy.objects.exclude(size__in=["", "n/a"])
            .values_list("size", flat=True)
            .distinct()
            .order_by("size")
        )
        breed_groups = list(
            Puppy.objects.exclude(breed_group__in=["", "n/a"])
            .values_list("breed_group", flat=True)
            .distinct()
            .order_by("breed_group")
        )

        lifespan_values: list[float] = []
        for age in Puppy.objects.exclude(age__in=["", "n/a"]).values_list(
            "age", flat=True
        ):
            span = parse_lifespan(age)
            if span is not None:
                lifespan_values.extend(span)

        if lifespan_values:
            lifespan_min = int(min(lifespan_values))
            lifespan_max = int(max(lifespan_values))
        else:
            lifespan_min, lifespan_max = 0, 20

        return Response(
            {
                "sizes": sizes,
                "breed_groups": breed_groups,
                "lifespan_min": lifespan_min,
                "lifespan_max": lifespan_max,
            },
            status=status.HTTP_200_OK,
        )
