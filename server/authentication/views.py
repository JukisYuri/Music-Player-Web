from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import UserSerializer, UserUpdateSerializer, RegisterSerializer
import requests
import uuid
import random
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from rest_framework.generics import ListAPIView
from django.shortcuts import get_object_or_404
from .serializers import UserSearchSerializer

User = get_user_model()

class GoogleLoginView(APIView):
    def post(self, request):
        google_access_token = request.data.get('access_token')
        if not google_access_token:
            return Response({'error': 'Access token is required'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Hỏi Google thông tin user
        google_user_info_url = 'https://www.googleapis.com/oauth2/v3/userinfo'
        response = requests.get(google_user_info_url, params={'access_token': google_access_token})

        if not response.ok:
            return Response({'error': 'Invalid google token'}, status=status.HTTP_400_BAD_REQUEST)

        user_info = response.json()
        email = user_info.get('email')

        # 2. Logic kiểm tra người mới
        try:
            # Nếu tìm thấy user -> Người cũ
            user = User.objects.get(email=email)
            is_new_user = False
        except User.DoesNotExist:
            # Nếu không thấy -> Người mới -> Tạo username tạm (VD: user_a1b2c3...)
            # Tại sao? Vì username là unique, dùng tên email dễ bị trùng hoặc lộ thông tin.
            temp_username = f"user_{uuid.uuid4().hex[:8]}"
            user = User.objects.create_user(
                username=temp_username,
                email=email,
                display_name=user_info.get('name', ''),
            )
            user.set_unusable_password() # Khóa password
            user.save()
            is_new_user = True

        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'is_new_user': is_new_user, # React sẽ dựa vào biến này để chuyển hướng
            'user': {
                'email': user.email,
                'username': user.username
            }
        })

# ==========================================

# --- Register ----
class RegisterView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        exist_user = User.objects.filter(email=email).first()
        if exist_user:
            if not exist_user.is_active:
                if password:
                    exist_user.set_password(password)
                    otp = str(random.randint(100000, 999999))
                    exist_user.otp_code = otp
                    exist_user.otp_created_at = timezone.now()
                    exist_user.save()

                    send_mail(
                        'Mã xác thực đăng ký (Gửi lại)',
                        f'Mã OTP của bạn là: {otp}',
                        settings.EMAIL_HOST_USER,
                        [exist_user.email],
                        fail_silently=False,
                    )
                    print("Mã OTP sinh ra (Gửi lại):", otp)  # DEBUG
                    return Response({"message": "Tài khoản chưa kích hoạt. OTP mới đã gửi!"}, status=200)
                else:
                    return Response({"message": "Email này đã được sử dụng bởi một tài khoản khác"}, status=400)
        # 1. Validate & Tạo User (Serializer làm việc này)
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save(is_active=False) # User chưa kích hoạt

            # 2. Sinh OTP
            otp = str(random.randint(100000, 999999))
            print("Mã OTP sinh ra:", otp)  # DEBUG
            user.otp_code = otp
            user.otp_created_at = timezone.now()
            user.save()

            send_mail(
                'Mã xác thực đăng ký',
                f'Mã OTP của bạn là: {otp}',
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=False,
            )

            return Response({"message": "OTP đã gửi!"}, status=201)
        return Response(serializer.errors, status=400)

# --- Resend OTP for Register ----
class ResendOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"message": "Email là bắt buộc"}, status=400)
        try:
            user = User.objects.get(email=email)
            # 1. Sinh OTP mới
            if user.is_active:
                return Response({"message": "Tài khoản đã được kích hoạt"}, status=400)

            otp = str(random.randint(100000, 999999))
            print("Mã OTP mới (Resend):", otp)  # DEBUG
            user.otp_code = otp
            user.otp_created_at = timezone.now()
            user.save()

            send_mail(
                'Mã xác thực gửi lại',
                f'Mã OTP của bạn là: {otp}',
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=False,
            )

            return Response({"message": "OTP mới đã gửi!"}, status=200)
        except User.DoesNotExist:
            return Response({"message": "Người dùng không tồn tại"}, status=404)

# -- Verify OTP ----
class VerifyOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp_input = request.data.get('otp_code')

        try:
            user = User.objects.get(email=email)

            # 1. Kiểm tra OTP
            if user.otp_code != otp_input:
                return Response({"message": "Sai mã OTP"}, status=400)

            # 2. Kiểm tra hết hạn
            if timezone.now() > user.otp_created_at + timedelta(minutes=1):
                 return Response({"message": "Mã OTP đã hết hạn"}, status=400)

            # 3. Kích hoạt User & Xóa OTP
            user.is_active = True
            user.otp_code = None
            user.save()

            # 4. Tạo Token JWT
            refresh = RefreshToken.for_user(user)

            return Response({
                "tokens": {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=200)

        except User.DoesNotExist:
            return Response({"message": "Người dùng không tồn tại"}, status=404)

# --- Forgot Password  ----
class ForgotPasswordView(APIView):
    # Quan trọng: Cho phép ai cũng gọi được (vì quên mật khẩu thì chưa login được)
    permission_classes = []
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"message": "Email là bắt buộc"}, status=400)
        try:
            user = User.objects.get(email=email)
            if not user.has_usable_password():
                return Response({"message": "Tài khoản này đăng nhập bằng Google, không thể đặt lại mật khẩu."}, status=400)
            # 1. Sinh OTP
            otp = str(random.randint(100000, 999999))
            print("Mã OTP (Forgot Password):", otp)  # DEBUG
            user.otp_code = otp
            user.otp_created_at = timezone.now()
            user.save()

            send_mail(
                'Mã xác thực quên mật khẩu',
                f'Mã OTP của bạn là: {otp}',
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=False,
            )

            return Response({"message": "OTP đã gửi!"}, status=200)
        except User.DoesNotExist:
            return Response({"message": "Người dùng không tồn tại"}, status=404)
        except Exception as e:
            return Response({"message": f"Lỗi xảy ra: {str(e)}"}, status=500)

# --- Reset Password and Verify OTP ----
class ResetPasswordView(APIView):
    permission_classes = []

    def post(self, request):
        # Lấy đủ 3 dữ liệu frontend gửi lên
        email = request.data.get('email')
        otp_input = request.data.get('otp')
        new_password = request.data.get('password')

        if not email or not otp_input or not new_password:
             return Response({"message": "Thiếu thông tin gửi lên"}, status=400)

        try:
            user = User.objects.get(email=email)
            # 1. Kiểm tra OTP có khớp không?
            if user.otp_code != otp_input:
                 return Response({"message": "Mã OTP không đúng"}, status=400)

            # 2. Kiểm tra OTP có hết hạn không? (ví dụ 5 phút)
            if timezone.now() > user.otp_created_at + timedelta(minutes=5):
                 return Response({"message": "Mã OTP đã hết hạn, vui lòng lấy lại"}, status=400)

            # 3. Đổi mật khẩu
            # Hàm set_password sẽ tự động mã hóa (Hash) mật khẩu mới
            user.set_password(new_password)
            user.is_active = True  # Kích hoạt tài khoản nếu chưa kích hoạt

            # 4. Dọn dẹp OTP sau khi dùng xong
            user.otp_code = None
            user.save()

            return Response({"message": "Đổi mật khẩu thành công! Hãy đăng nhập lại."}, status=200)
        except User.DoesNotExist:
             return Response({"message": "Người dùng không tồn tại"}, status=404)

# Onboarding Submit
class UpdateProfileView(generics.UpdateAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = UserUpdateSerializer
    # Parser giúp Django hiểu được dữ liệu dạng 'multipart/form-data' (có file đính kèm)
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        # Đảm bảo user chỉ sửa được chính mình
        return self.request.user

    def update(self, request, *args, **kwargs):
        print("--- DEBUG UPDATE PROFILE ---")
        print("Dữ liệu text nhận được:", request.data)
        print("File ảnh nhận được:", request.FILES)

        return super().update(request, *args, **kwargs)

class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    # Bắt buộc phải có Token mới xem được
    permission_classes = [IsAuthenticated]
    def get_object(self):
        return self.request.user
    
# ============================================================================
# Search Users
class SearchUserView(ListAPIView):
    serializer_class = UserSearchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get('q', '') # Lấy từ url: /api/search/?q=mizu
        if query:
            # Tìm username chứa từ khóa (icontains = không phân biệt hoa thường)
            # Và loại trừ chính mình (exclude self)
            return User.objects.filter(username__icontains=query).exclude(id=self.request.user.id)
        return User.objects.none()

# Follow/Unfollow User
class FollowUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        # Tìm người muốn follow
        target_user = get_object_or_404(User, username=username)
        current_user = request.user

        if current_user == target_user:
            return Response({"message": "Không thể tự follow chính mình"}, status=400)

        # Logic Toggle Follow / Unfollow
        if current_user.following.filter(id=target_user.id).exists():
            current_user.following.remove(target_user)
            is_following = False
            msg = "Đã hủy theo dõi"
        else:
            current_user.following.add(target_user)
            is_following = True
            msg = "Đã theo dõi"

        return Response({
            "message": msg,
            "is_following": is_following, # Trả về trạng thái mới để React cập nhật nút bấm
            "follower_count": target_user.followers.count() # Cập nhật lại số người theo dõi
        }, status=200)
    
class UserFollowingListView(ListAPIView):
    serializer_class = UserSearchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Trả về danh sách những người mà user hiện tại đang follow
        return self.request.user.following.all()
