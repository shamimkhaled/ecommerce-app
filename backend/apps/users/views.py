from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Notification, User, WishlistItem
from .serializers import (
    ChangePasswordSerializer,
    NotificationSerializer,
    RegisterSerializer,
    UserUpdateSerializer,
    UserPublicSerializer,
    WishlistItemSerializer,
)
from .tokens import EmailTokenObtainPairSerializer
from apps.siteconfig.services import send_dynamic_email


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        data = UserPublicSerializer(user, context={"request": request}).data
        return Response(data, status=status.HTTP_201_CREATED)


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ("PATCH", "PUT"):
            return UserUpdateSerializer
        return UserPublicSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserPublicSerializer(instance, context={"request": request}).data)


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.user
        data = {
            "access": serializer.validated_data["access"],
            "refresh": serializer.validated_data["refresh"],
            "user": UserPublicSerializer(user, context={"request": request}).data,
        }
        return Response(data)


class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        return Response({"detail": "Logged out. Discard tokens on the client."})


class ChangePasswordView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        ser = ChangePasswordSerializer(data=request.data, context={"request": request})
        ser.is_valid(raise_exception=True)
        request.user.set_password(ser.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return Response({"detail": "Password changed successfully."})


class ForgotPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"email": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.filter(email=email).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            frontend_base = request.data.get("frontend_base_url") or "http://localhost:3000/reset-password"
            reset_link = f"{frontend_base}?uid={uid}&token={token}"
            send_dynamic_email(
                subject="Reset your password",
                body=f"Use this link to reset your password: {reset_link}",
                to=[user.email],
            )
        return Response({"detail": "If the email exists, a reset link has been sent."})


class ResetPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        uid = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("new_password")
        if not (uid and token and new_password):
            return Response({"detail": "uid, token and new_password are required."}, status=400)
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except Exception:
            return Response({"detail": "Invalid reset link."}, status=400)
        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired token."}, status=400)
        validate_password(new_password, user=user)
        user.set_password(new_password)
        user.save(update_fields=["password"])
        return Response({"detail": "Password reset successful."})


class WishlistViewSet(viewsets.GenericViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = WishlistItemSerializer

    def list(self, request):
        qs = (
            WishlistItem.objects.filter(user=request.user)
            .select_related("product__category", "product__brand")
            .prefetch_related("product__images")
        )
        return Response(self.get_serializer(qs, many=True, context={"request": request}).data)

    @action(detail=False, methods=["post"], url_path="toggle")
    def toggle(self, request):
        pid = request.data.get("product_id")
        if not pid:
            return Response({"detail": "product_id required"}, status=400)
        obj = WishlistItem.objects.filter(user=request.user, product_id=pid).first()
        if obj:
            obj.delete()
        else:
            WishlistItem.objects.create(user=request.user, product_id=pid)
        return self.list(request)


class NotificationViewSet(viewsets.GenericViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = NotificationSerializer

    def list(self, request):
        qs = Notification.objects.filter(user=request.user)
        return Response(self.get_serializer(qs, many=True).data)

    @action(detail=False, methods=["post"], url_path="mark-read")
    def mark_read(self, request):
        nid = request.data.get("id")
        qs = Notification.objects.filter(user=request.user)
        if nid:
            qs.filter(pk=nid).update(is_read=True)
        else:
            qs.update(is_read=True)
        return Response({"detail": "Updated"})


class GoogleLoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        id_token = request.data.get("id_token")
        if not id_token:
            return Response({"detail": "id_token required"}, status=400)
        try:
            from google.oauth2 import id_token as gid
            from google.auth.transport import requests as grequests

            payload = gid.verify_oauth2_token(id_token, grequests.Request(), settings.GOOGLE_CLIENT_ID)
        except Exception:
            return Response({"detail": "Invalid Google token"}, status=400)
        email = payload.get("email")
        sub = payload.get("sub")
        name = payload.get("name") or (email.split("@")[0] if email else "Google User")
        if not email:
            return Response({"detail": "Google account email unavailable"}, status=400)
        user = User.objects.filter(email=email).first()
        if not user:
            user = User.objects.create_user(email=email, name=name, password=User.objects.make_random_password())
        user.google_sub = sub or user.google_sub
        user.save(update_fields=["google_sub"])
        # create token pair without password check for verified Google identity
        token = EmailTokenObtainPairSerializer.get_token(user)
        data = {
            "access": str(token.access_token),
            "refresh": str(token),
            "user": UserPublicSerializer(user, context={"request": request}).data,
        }
        return Response(data)
