from uuid import UUID

from django.db.models import Avg, Count, Prefetch
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.products.models import Product, ProductImage
from apps.products.serializers import ProductListSerializer
from apps.reviews.models import Review

from .models import Cart
from .services import get_or_create_cart_for_request, merge_guest_cart_into_user


def _serialize_cart(cart, request):
    item_lines = list(
        cart.items.select_related("product__category", "product__brand").prefetch_related(
            Prefetch(
                "product__images",
                queryset=ProductImage.objects.order_by("-is_primary", "sort_order", "id"),
            )
        )
    )
    pids = [li.product_id for li in item_lines]
    stats = {}
    if pids:
        rows = (
            Review.objects.filter(product_id__in=pids, is_approved=True)
            .values("product_id")
            .annotate(rating_avg=Avg("rating"), reviews_count=Count("id"))
        )
        stats = {r["product_id"]: r for r in rows}

    out_items = []
    for line in item_lines:
        p = line.product
        row = stats.get(p.pk, {})
        p.rating_avg = row.get("rating_avg")
        p.reviews_count = row.get("reviews_count") or 0
        prod_data = ProductListSerializer(p, context={"request": request}).data
        prod_data["id"] = str(p.pk)
        prod_data["quantity"] = line.quantity
        out_items.append(prod_data)

    return {
        "guest_token": str(cart.guest_token) if cart.guest_token and not cart.user_id else None,
        "items": out_items,
    }


def _guest_response(cart, request, status_code=status.HTTP_200_OK):
    data = _serialize_cart(cart, request)
    resp = Response(data, status=status_code)
    if cart.guest_token and not cart.user_id:
        resp["X-Cart-Token"] = str(cart.guest_token)
    return resp


class CartViewSet(viewsets.ViewSet):
    permission_classes = (permissions.AllowAny,)

    def list(self, request):
        if not request.user.is_authenticated and not (
            request.headers.get("X-Cart-Token") or request.headers.get("x-cart-token")
        ):
            return Response({"guest_token": None, "items": []})

        cart = get_or_create_cart_for_request(request)
        return _guest_response(cart, request)

    def create(self, request):
        """Add line: { product_id, quantity }"""
        cart = get_or_create_cart_for_request(request)
        pid = request.data.get("product_id")
        qty = int(request.data.get("quantity") or 1)
        if qty < 1:
            return Response({"detail": "Invalid quantity"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            product = Product.objects.get(pk=pid, is_active=True)
        except (Product.DoesNotExist, ValueError, TypeError):
            return Response({"detail": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        if product.stock < qty:
            return Response({"detail": "Not enough stock"}, status=status.HTTP_400_BAD_REQUEST)

        item, created = cart.items.get_or_create(product=product, defaults={"quantity": qty})
        if not created:
            nq = item.quantity + qty
            if product.stock < nq:
                return Response({"detail": "Not enough stock"}, status=status.HTTP_400_BAD_REQUEST)
            item.quantity = nq
            item.save(update_fields=["quantity"])

        return _guest_response(cart, request, status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="set-quantity")
    def set_quantity(self, request):
        cart = get_or_create_cart_for_request(request)
        pid = request.data.get("product_id")
        qty = int(request.data.get("quantity") or 0)
        item = cart.items.filter(product_id=pid).first()
        if not item:
            return Response({"detail": "Not in cart"}, status=status.HTTP_404_NOT_FOUND)
        if qty < 1:
            item.delete()
            return _guest_response(cart, request)
        if item.product.stock < qty:
            return Response({"detail": "Not enough stock"}, status=status.HTTP_400_BAD_REQUEST)
        item.quantity = qty
        item.save(update_fields=["quantity"])
        return _guest_response(cart, request)

    @action(detail=False, methods=["post"], url_path="remove")
    def remove(self, request):
        cart = get_or_create_cart_for_request(request)
        pid = request.data.get("product_id")
        cart.items.filter(product_id=pid).delete()
        return _guest_response(cart, request)

    @action(detail=False, methods=["delete"], url_path="clear")
    def clear(self, request):
        cart = get_or_create_cart_for_request(request)
        cart.items.all().delete()
        return _guest_response(cart, request)

    @action(detail=False, methods=["post"], url_path="merge", permission_classes=[permissions.IsAuthenticated])
    def merge(self, request):
        token = request.data.get("guest_token")
        if not token:
            return Response({"detail": "guest_token required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            tid = UUID(str(token))
        except ValueError:
            return Response({"detail": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        guest_cart = Cart.objects.filter(user__isnull=True, guest_token=tid).first()
        if not guest_cart:
            return Response({"detail": "No guest cart"}, status=status.HTTP_404_NOT_FOUND)
        merge_guest_cart_into_user(guest_cart, request.user)
        cart, _ = Cart.objects.get_or_create(user=request.user, defaults={"guest_token": None})
        return _guest_response(cart, request)
