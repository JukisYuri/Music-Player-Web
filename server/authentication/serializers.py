from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Notification

User = get_user_model()

# 1. Serializer dùng cho việc Đăng Ký (Register)
class RegisterSerializer(serializers.ModelSerializer):
    # Password phải là write_only (chỉ gửi lên để lưu, không bao giờ trả về frontend)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    class Meta:
        model = User
        # Những trường user cần nhập khi đăng ký
        fields = ['email', 'password'] 
    
    def create(self, validated_data):
        email = validated_data['email']
        password = validated_data['password']
        # Đây là chỗ ORM làm việc: Tạo user mới và mã hóa password
        username = email.split('@')[0]
        user = User.objects.create_user( # Sử dụng create_user để đảm bảo password được mã hóa
            email=email,
            password=password,
            username=username,
            is_active=False  # User mới đăng ký chưa active
        )
        return user

# 2. Serializer dùng để xác thực OTP khi đăng ký
class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)
    
# 3. Serializer dùng để cập nhật thông tin User, bao gồm cả OnBoarding từ 2 flow Register và Google Login
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

# Serializer dùng để hiển thị thông tin User (Profile/Context)
class UserSerializer(serializers.ModelSerializer):
    is_in_google_social = serializers.SerializerMethodField()
    followers_count = serializers.IntegerField(source='followers.count', read_only=True)
    following_count = serializers.IntegerField(source='following.count', read_only=True)
    following_ids = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'username', 'display_name', 'email', 'is_active', 'date_joined', 'description', 'profile_image_url', 'is_in_google_social', 'followers_count', 'following_count', 'following_ids']
        read_only_fields = ['id', 'date_joined', 'is_active', 'email', 'username'] 

    # Logic check google social account
    def get_is_in_google_social(self, obj):
        return not obj.has_usable_password()
    
    def get_following_ids(self, obj):
        return list(obj.following.values_list('id', flat=True))
    
class UserSearchSerializer(serializers.ModelSerializer):
    is_following = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'username', 'display_name', 'profile_image_url', 'is_following']
    
    def get_is_following(self, obj):
        # Lấy user đang thực hiện search
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Kiểm tra xem user tìm thấy (obj) có nằm trong list following của mình không
            return request.user.following.filter(id=obj.id).exists()
        return False
    
class PublicProfileSerializer(serializers.ModelSerializer):
    followers_count = serializers.IntegerField(source='followers.count', read_only=True)
    following_count = serializers.IntegerField(source='following.count', read_only=True)
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'display_name', 'description', 'profile_image_url', 'followers_count', 'following_count', 'is_following']

    # Kiểm tra người đang xem (request.user) có follow user này không
    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user.following.filter(id=obj.id).exists()
        return False
    
class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.display_name', read_only=True)
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'sender_username', 'sender_name', 'sender_avatar', 'notification_type', 'message', 'created_at', 'is_read']

    def get_sender_avatar(self, obj):
        if obj.sender.profile_image_url:
            return obj.sender.profile_image_url.url
        return None