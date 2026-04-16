from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("order", "method", "status", "created_at")
    list_filter = ("method", "status")
    search_fields = ("order__order_number",)
    autocomplete_fields = ("order",)
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (None, {"fields": ("order", "method", "status")}),
        ("Timestamps", {"classes": ("collapse",), "fields": ("created_at", "updated_at")}),
    )
