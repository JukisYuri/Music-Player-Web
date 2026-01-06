"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from music.views import GoogleLoginView, UpdateProfileView, UserProfileView, RegisterView, VerifyOTPView, ForgotPasswordView, ResetPasswordView, ResendOTPView
urlpatterns = [
    path('admin/', admin.site.urls),
    # path('api/', include('users.urls')),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api/music/', include('music.urls')),
    path('api/voice/', include('speechToText.urls')),
    path('api/auth/google/', GoogleLoginView.as_view()),
    path('api/user/update-profile/', UpdateProfileView.as_view()), # URL cho Onboarding
    path('api/user/me/', UserProfileView.as_view()),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('api/forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('api/reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('api/resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
