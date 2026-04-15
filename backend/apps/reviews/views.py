from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Order, OrderItem
from apps.products.models import Product
from apps.products.views import base_product_queryset

from .models import Review
from .serializers import ReviewCreateSerializer, ReviewReadSerializer


class ProductReviewListCreateView(generics.ListCreateAPIView):
    def get_product(self):
        lookup = self.kwargs["lookup"]
        qs = base_product_queryset()
        if str(lookup).isdigit():
            return get_object_or_404(qs, pk=int(lookup))
        return get_object_or_404(qs, slug=lookup)

    def get_queryset(self):
        p = self.get_product()
        user = self.request.user
        qs = Review.objects.filter(product=p)
        if user.is_authenticated:
            qs = qs.filter(Q(is_approved=True) | Q(user=user))
        else:
            qs = qs.filter(is_approved=True)
        return qs.select_related("user")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ReviewCreateSerializer
        return ReviewReadSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def create(self, request, *args, **kwargs):
        p = self.get_product()
        delivered = OrderItem.objects.filter(
            order__user=request.user,
            product_id=p.pk,
            order__status=Order.Status.DELIVERED,
        ).exists()
        if not delivered:
            return Response(
                {"detail": "You can only review products from delivered orders."},
                status=status.HTTP_403_FORBIDDEN,
            )
        existing = Review.objects.filter(user=request.user, product=p).first()
        if existing:
            if existing.is_approved:
                return Response({"detail": "You already reviewed this product."}, status=status.HTTP_400_BAD_REQUEST)
            # Backward-compatible behavior for older pending reviews:
            # allow user to update and publish their existing pending review.
            ser = self.get_serializer(existing, data=request.data, partial=True)
            ser.is_valid(raise_exception=True)
            ser.save(is_approved=True)
            return Response({"detail": "Review submitted successfully."}, status=status.HTTP_200_OK)
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        # For verified delivered purchases, publish immediately so users
        # can see rating/review impact right after submitting.
        ser.save(user=request.user, product=p, is_approved=True)
        return Response(
            {"detail": "Review submitted successfully."},
            status=status.HTTP_201_CREATED,
        )


class ProductReviewEligibilityView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, lookup):
        qs = base_product_queryset()
        product = get_object_or_404(qs, pk=int(lookup)) if str(lookup).isdigit() else get_object_or_404(qs, slug=lookup)
        delivered = OrderItem.objects.filter(
            order__user=request.user,
            product_id=product.pk,
            order__status=Order.Status.DELIVERED,
        ).exists()
        already_reviewed = Review.objects.filter(user=request.user, product=product).exists()
        return Response(
            {
                "can_review": bool(delivered and not already_reviewed),
                "delivered": delivered,
                "already_reviewed": already_reviewed,
            }
        )
