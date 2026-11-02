from django.urls import path

from dogs.views import PuppyFiltersView, PuppyListView

urlpatterns = [
    path("puppies/", PuppyListView.as_view(), name="puppy-list"),
    path("puppies/filters/", PuppyFiltersView.as_view(), name="puppy-filters"),
]
