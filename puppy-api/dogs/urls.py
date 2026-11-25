from django.urls import path

from dogs.views import PuppyDbHealthView, PuppyFiltersView, PuppyListView

urlpatterns = [
    path("puppies/health/", PuppyDbHealthView.as_view(), name="puppy-db-health"),
    path("puppies/", PuppyListView.as_view(), name="puppy-list"),
    path("puppies/filters/", PuppyFiltersView.as_view(), name="puppy-filters"),
]
