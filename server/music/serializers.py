from rest_framework import serializers
from .models import Song
from django.contrib.auth import get_user_model

User = get_user_model()
class SongSerializer(serializers.ModelSerializer):
    class Meta:
        model = Song
        fields = '__all__'

# 1. Serializer dùng cho việc Đăng Ký (Register)
class RegisterSerializer(serializers.ModelSerializer):
    # Password phải là write_only (chỉ gửi lên để lưu, không bao giờ trả về frontend)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    class Meta:
        model = User
        # Những trường user cần nhập khi đăng ký
        fields = ['username', 'email', 'password', 'display_name'] 
    
    def create(self, validated_data):
        # Đây là chỗ ORM làm việc: Tạo user mới và mã hóa password
        # create_user là hàm của Django giúp tự động hash password
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            display_name=validated_data.get('display_name', '')
        )
        return user
    
class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'display_name', 'description', 'profile_image_url']

    def validate_username(self, value):
        # Kiểm tra trùng lặp
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError("Username này đã có người sử dụng.")
        return value

# 2. Serializer dùng để hiển thị thông tin User (Profile/Context)
class UserSerializer(serializers.ModelSerializer):
    is_in_google_social = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'display_name', 'email', 'is_active', 'date_joined', 'description', 'profile_image_url', 'is_in_google_social']
        read_only_fields = ['id', 'date_joined', 'is_active', 'email', 'username'] 

    # Logic check google social account
    def get_is_in_google_social(self, obj):
        return not obj.has_usable_password()