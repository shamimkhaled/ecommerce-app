from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter

from .views import (
    ChangePasswordView,
    EmailTokenObtainPairView,
    ForgotPasswordView,
    GoogleLoginView,
    LogoutView,
    MeView,
    NotificationViewSet,
    RegisterView,
    ResetPasswordView,
    WishlistViewSet,
)

router = DefaultRouter()
router.register(r"wishlist", WishlistViewSet, basename="wishlist")
router.register(r"notifications", NotificationViewSet, basename="notifications")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", EmailTokenObtainPairView.as_view(), name="auth-login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="auth-token-refresh"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("change-password/", ChangePasswordView.as_view(), name="auth-change-password"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="auth-forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="auth-reset-password"),
    path("google/", GoogleLoginView.as_view(), name="auth-google"),
    *router.urls,
]
