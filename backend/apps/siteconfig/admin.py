from django.contrib import admin

from .models import CMSPage, EmailSetting, SiteSetting


@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    fieldsets = (
        ("Brand", {"fields": ("site_name", "logo", "header_text", "footer_text")}),
        ("Homepage Images", {"fields": ("hero_image", "homepage_banner_image")}),
        ("Commerce", {"fields": ("default_currency", "usd_to_bdt_rate")}),
        ("Theme", {"fields": ("primary_color", "secondary_color", "button_color", "link_color", "background_color", "footer_color")}),
        ("SEO", {"fields": ("seo_title", "seo_description", "seo_keywords")}),
    )

    def has_add_permission(self, request):
        return not SiteSetting.objects.exists()


@admin.register(EmailSetting)
class EmailSettingAdmin(admin.ModelAdmin):
    fields = ("enabled", "host", "port", "use_tls", "username", "password", "from_email")

    def has_add_permission(self, request):
        return not EmailSetting.objects.exists()


@admin.register(CMSPage)
class CMSPageAdmin(admin.ModelAdmin):
    list_display = ("slug", "title", "is_active", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("slug", "title", "content")
