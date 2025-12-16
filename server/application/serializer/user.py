from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', "display_name" 'email', 'is_active', 'date_joined', 'description', 'profile_image_url']
        read_only_fields = fields
    
    def is_in_google_social(self, obj):
        pass  # Implementation to check if user is linked with Google social account