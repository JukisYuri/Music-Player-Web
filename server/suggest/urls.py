
from django.urls import path
from .views import SearchSuggestionView

urlpatterns = [
    # Đường dẫn sẽ là: /api/suggest/search/
    path('search/', SearchSuggestionView.as_view(), name='search-suggest'),
]