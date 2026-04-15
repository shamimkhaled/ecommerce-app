from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from apps.products.serializers import ProductListSerializer
from .models import Notification, User, WishlistItem


class UserPublicSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "name", "email", "role", "avatar", "phone", "address", "preferences")

    def get_id(self, obj):
        return str(obj.pk)

    def get_role(self, obj):
        return obj.frontend_role

    def get_avatar(self, obj):
        request = self.context.get("request")
        if obj.avatar and hasattr(obj.avatar, "url"):
            u = obj.avatar.url
            return request.build_absolute_uri(u) if request else u
        return ""


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("name", "phone", "address", "avatar", "preferences")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    name = serializers.CharField(max_length=255)

    class Meta:
        model = User
        fields = ("email", "password", "name")

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        user = self.context["request"].user
        if not user.check_password(attrs["current_password"]):
            raise serializers.ValidationError({"current_password": "Current password is incorrect."})
        validate_password(attrs["new_password"], user=user)
        return attrs


class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = WishlistItem
        fields = ("id", "product", "created_at")


class NotificationSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source="order.order_number", read_only=True)

    class Meta:
        model = Notification
        fields = ("id", "title", "message", "type", "is_read", "order_number", "created_at")
