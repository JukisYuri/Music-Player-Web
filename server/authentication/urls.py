from django.urls import path
from authentication.views import (
    GoogleLoginView,
    UpdateProfileView,
    UserProfileView,
    RegisterView,
    VerifyOTPView,
    ForgotPasswordView,
    ResetPasswordView,
    ResendOTPView,
    SearchUserView,
    FollowUserView,
    UserFollowingListView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# URL patterns cho authentication app
urlpatterns = [
    # Login thường (trả về access/refresh token)
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Google Login
    path('auth/google/', GoogleLoginView.as_view(), name='google-login'),
    
    # Register
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),

    # ForgotPassword
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),

    # User Profile, OnBoarding
    path('user/update-profile/', UpdateProfileView.as_view(), name='update-profile'),
    path('user/me/', UserProfileView.as_view(), name='user-me'),

    # Follow/Unfollow User
    path('user/search/', SearchUserView.as_view(), name='user-search'),
    path('user/follow/<str:username>/', FollowUserView.as_view(), name='user-follow'),
    path('user/me/following/', UserFollowingListView.as_view(), name='user-following-list'),
]