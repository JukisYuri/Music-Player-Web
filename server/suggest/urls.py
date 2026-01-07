
from django.urls import path
from .views import SearchSuggestionView

urlpatterns = [
    path('search/', SearchSuggestionView.as_view(), name='search-suggest'),
]