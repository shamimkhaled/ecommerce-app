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
    list_display = ("order_number", "user", "status", "total", "discount_amount", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("order_number", "user__email", "coupon_code")
    autocomplete_fields = ("user",)
    readonly_fields = (
        "order_number",
        "subtotal",
        "shipping_cost",
        "tax_amount",
        "discount_amount",
        "coupon_code",
        "total",
        "created_at",
        "updated_at",
    )
    fieldsets = (
        (
            "Order",
            {
                "description": "Change status to move the order through fulfillment. Totals are set at checkout.",
                "fields": ("order_number", "user", "status"),
            },
        ),
        (
            "Totals",
            {
                "fields": ("subtotal", "shipping_cost", "tax_amount", "discount_amount", "coupon_code", "total"),
            },
        ),
        (
            "Timestamps",
            {
                "classes": ("collapse",),
                "fields": ("created_at", "updated_at"),
            },
        ),
    )
    inlines = [ShippingInline, OrderItemInline]


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ("code", "discount_type", "value", "is_active", "usage_limit", "used_count", "valid_to")
    list_filter = ("is_active", "discount_type")
    search_fields = ("code",)
    fieldsets = (
        (
            None,
            {
                "fields": ("code", "is_active", "discount_type", "value"),
            },
        ),
        (
            "Rules",
            {
                "description": "Minimum subtotal applies before discount. Max discount caps percent-based coupons.",
                "fields": ("min_subtotal", "max_discount", "valid_from", "valid_to", "usage_limit", "used_count"),
            },
        ),
    )
    readonly_fields = ("used_count",)


@admin.register(ShippingZone)
class ShippingZoneAdmin(admin.ModelAdmin):
    list_display = ("name", "country", "city", "delivery_charge", "free_shipping_threshold", "estimated_days", "priority", "is_active")
    list_filter = ("is_active", "country")
    search_fields = ("name", "country", "city")
    fieldsets = (
        (
            "Area",
            {
                "description": "Match checkout city + country. Leave city empty for a whole-country default.",
                "fields": ("name", "country", "city", "is_active", "priority"),
            },
        ),
        (
            "Charges",
            {
                "fields": ("delivery_charge", "free_shipping_threshold", "estimated_days"),
            },
        ),
    )
