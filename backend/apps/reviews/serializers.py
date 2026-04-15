from rest_framework import serializers

from .models import Review


class ReviewReadSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True, source="pk")
    userId = serializers.CharField(read_only=True, source="user_id")
    userName = serializers.CharField(read_only=True, source="user.name")
    date = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ("id", "userId", "userName", "rating", "comment", "date")

    def get_date(self, obj):
        return obj.created_at.strftime("%Y-%m-%d")


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ("rating", "comment")
