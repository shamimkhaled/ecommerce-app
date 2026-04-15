from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cart.models import Cart

from .models import Order
from .serializers import CheckoutSerializer, OrderDetailSerializer, OrderListSerializer
from .services import _compute_totals, create_order_from_cart


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    lookup_field = "order_number"

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .prefetch_related("items")
            .select_related("payment")
            .order_by("-created_at")
        )

    def get_serializer_class(self):
        if self.action == "retrieve" or self.action == "track":
            return OrderDetailSerializer
        return OrderListSerializer

    @action(detail=True, methods=["get"], url_path="track")
    def track(self, request, order_number=None):
        order = self.get_object()
        ser = OrderDetailSerializer(order, context={"request": request})
        return Response(ser.data)


class CheckoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        ser = CheckoutSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        cart, _ = Cart.objects.get_or_create(user=request.user, defaults={"guest_token": None})
        try:
            order = create_order_from_cart(
                user=request.user,
                cart=cart,
                shipping=ser.validated_data["shipping"],
                coupon_code=ser.validated_data.get("coupon_code") or None,
                request=request,
            )
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        out = OrderDetailSerializer(order, context={"request": request}).data
        return Response(out, status=status.HTTP_201_CREATED)


class CouponPreviewView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user, defaults={"guest_token": None})
        coupon_code = (request.data.get("coupon_code") or "").strip() or None
        try:
            subtotal, shipping_cost, tax_amount, discount_amount, total, coupon = _compute_totals(
                cart, coupon_code, request.data.get("shipping") or None
            )
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(
            {
                "coupon_code": coupon.code if coupon else "",
                "subtotal": subtotal,
                "shipping_cost": shipping_cost,
                "tax_amount": tax_amount,
                "discount_amount": discount_amount,
                "total": total,
            }
        )
