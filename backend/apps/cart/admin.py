from django.contrib import admin

from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    autocomplete_fields = ("product",)


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "guest_token", "updated_at")
    search_fields = ("user__email", "guest_token")
    autocomplete_fields = ("user",)
    inlines = [CartItemInline]
    fieldsets = (
        (
            None,
            {
                "description": "Guest carts use guest_token; logged-in carts attach to user.",
                "fields": ("user", "guest_token", "updated_at"),
            },
        ),
    )
    readonly_fields = ("updated_at",)


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("cart", "product", "quantity")
