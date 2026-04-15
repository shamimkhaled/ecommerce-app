from django.contrib import admin

from .models import Brand, Category, HomepageSection, Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "image")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "brand", "price", "stock", "is_featured", "is_active", "created_at")
    list_filter = ("category", "brand", "is_featured", "is_trending", "is_active")
    search_fields = ("name", "slug", "description")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductImageInline]
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (None, {"fields": ("name", "slug", "description", "category", "brand")}),
        ("Pricing", {"fields": ("price", "discount", "stock")}),
        ("Visibility", {"fields": ("is_featured", "is_trending", "is_active")}),
        ("SEO", {"fields": ("meta_title", "meta_description", "meta_keywords")}),
        ("Metadata", {"fields": ("specs", "created_at", "updated_at")}),
    )


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "is_primary", "sort_order")
    list_filter = ("is_primary",)


@admin.register(HomepageSection)
class HomepageSectionAdmin(admin.ModelAdmin):
    list_display = ("title", "key", "is_active", "sort_order")
    list_filter = ("is_active",)
    filter_horizontal = ("products",)
