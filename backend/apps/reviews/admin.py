from django.contrib import admin

from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "rating", "is_approved", "created_at")
    list_filter = ("is_approved", "rating")
    search_fields = ("user__email", "product__name", "comment")
    autocomplete_fields = ("user", "product", "order")
    fieldsets = (
        (
            None,
            {
                "fields": ("user", "product", "order", "rating", "comment", "is_approved"),
            },
        ),
    )
