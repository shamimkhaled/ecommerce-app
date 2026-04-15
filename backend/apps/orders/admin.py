from django.contrib import admin

from .models import Coupon, Order, OrderItem, ShippingAddress, ShippingZone


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "product_name", "product_slug", "quantity", "unit_price", "image_url")


class ShippingInline(admin.StackedInline):
    model = ShippingAddress
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("order_number", "user", "status", "total", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("order_number", "user__email")
    readonly_fields = ("order_number", "subtotal", "shipping_cost", "tax_amount", "total", "created_at", "updated_at")
    inlines = [ShippingInline, OrderItemInline]


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ("code", "discount_type", "value", "is_active", "usage_limit", "used_count", "valid_to")
    list_filter = ("is_active", "discount_type")
    search_fields = ("code",)


@admin.register(ShippingZone)
class ShippingZoneAdmin(admin.ModelAdmin):
    list_display = ("name", "country", "city", "delivery_charge", "free_shipping_threshold", "estimated_days", "priority", "is_active")
    list_filter = ("is_active", "country")
    search_fields = ("name", "country", "city")
