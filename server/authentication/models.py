from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    display_name = models.CharField(max_length=255, blank=True, null=True)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    profile_image_url = models.ImageField(upload_to='avatars/', blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    otp_code = models.CharField(max_length=6, null=True, blank=True)
    otp_created_at = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'display_name']
    
    def __str__(self):
        return self.email
