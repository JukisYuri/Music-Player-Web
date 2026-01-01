# speechToText/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('process/', views.voice_command_view, name='process_voice'),
]