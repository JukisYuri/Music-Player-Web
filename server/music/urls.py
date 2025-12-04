from django.urls import path
from .views import YouTubeStreamView

urlpatterns = [
    path('stream/', YouTubeStreamView.as_view(), name='youtube-stream'),
]