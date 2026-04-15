from rest_framework import serializers

from .models import Order, OrderItem


class OrderItemOutSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="product_name")
    product_slug = serializers.CharField(allow_blank=True)
    product_id = serializers.CharField(source="product.pk", default="", read_only=True)
    price = serializers.DecimalField(max_digits=12, decimal_places=2, source="unit_price")
    image = serializers.CharField(source="image_url", allow_blank=True)

    class Meta:
        model = OrderItem
        fields = ("name", "product_slug", "product_id", "quantity", "price", "image")


class OrderListSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="order_number", read_only=True)
    date = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    items = OrderItemOutSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ("id", "date", "status", "total", "items")

    def get_date(self, obj):
        return obj.created_at.strftime("%Y-%m-%d")

    def get_status(self, obj):
        return obj.get_status_display()


class OrderDetailSerializer(OrderListSerializer):
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    shipping_cost = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    tax_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    discount_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    coupon_code = serializers.CharField(read_only=True)
    payment_status = serializers.SerializerMethodField()

    class Meta(OrderListSerializer.Meta):
        fields = OrderListSerializer.Meta.fields + (
            "subtotal",
            "shipping_cost",
            "tax_amount",
            "discount_amount",
            "coupon_code",
            "payment_status",
        )

    def get_payment_status(self, obj):
        pay = getattr(obj, "payment", None)
        return pay.get_status_display() if pay else ""


class ShippingInputSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=120)
    last_name = serializers.CharField(max_length=120)
    address_line1 = serializers.CharField(max_length=255)
    city = serializers.CharField(max_length=120)
    postal_code = serializers.CharField(max_length=32)
    country = serializers.CharField(max_length=120, required=False, default="US")


class CheckoutSerializer(serializers.Serializer):
    shipping = ShippingInputSerializer()
    payment_method = serializers.ChoiceField(choices=["cod"], default="cod")
    coupon_code = serializers.CharField(max_length=40, required=False, allow_blank=True)
