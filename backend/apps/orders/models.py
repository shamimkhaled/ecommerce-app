from django.conf import settings
from django.db import models


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        PROCESSING = "processing", "Processing"
        SHIPPED = "shipped", "Shipped"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders", db_index=True
    )
    order_number = models.CharField(max_length=32, unique=True, db_index=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True
    )
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    coupon_code = models.CharField(max_length=40, blank=True)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "orders_order"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return self.order_number


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        "products.Product", on_delete=models.SET_NULL, null=True, related_name="order_items"
    )
    product_name = models.CharField(max_length=255)
    product_slug = models.SlugField(max_length=280, blank=True)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    image_url = models.URLField(max_length=500, blank=True)

    class Meta:
        db_table = "orders_orderitem"

    @property
    def line_total(self):
        return self.unit_price * self.quantity


class ShippingAddress(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="shipping_address")
    first_name = models.CharField(max_length=120)
    last_name = models.CharField(max_length=120)
    address_line1 = models.CharField(max_length=255)
    city = models.CharField(max_length=120)
    postal_code = models.CharField(max_length=32)
    country = models.CharField(max_length=120, default="US")

    class Meta:
        db_table = "orders_shippingaddress"


class Coupon(models.Model):
    class DiscountType(models.TextChoices):
        PERCENT = "percent", "Percent"
        FIXED = "fixed", "Fixed"

    code = models.CharField(max_length=40, unique=True, db_index=True)
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices, default=DiscountType.PERCENT)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    min_subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    max_discount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_to = models.DateTimeField(null=True, blank=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    used_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "orders_coupon"
        ordering = ["-created_at"]

    def __str__(self):
        return self.code


class ShippingZone(models.Model):
    name = models.CharField(max_length=120)
    country = models.CharField(max_length=120)
    city = models.CharField(max_length=120, blank=True)
    delivery_charge = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    free_shipping_threshold = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    estimated_days = models.PositiveSmallIntegerField(default=3)
    priority = models.PositiveSmallIntegerField(default=100, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = "orders_shippingzone"
        ordering = ["priority", "id"]

    def __str__(self):
        city = f" - {self.city}" if self.city else ""
        return f"{self.name} ({self.country}{city})"
