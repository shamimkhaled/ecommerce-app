from django import forms
from django.contrib import admin

from .forms import SiteSettingAdminForm
from .models import CMSPage, EmailSetting, SiteSetting


class EmailSettingAdminForm(forms.ModelForm):
    class Meta:
        model = EmailSetting
        fields = "__all__"
        widgets = {
            "password": forms.PasswordInput(render_value=True, attrs={"autocomplete": "new-password"}),
        }
        help_texts = {
            "enabled": "Turn on only after host, port, and credentials are correct.",
            "host": "SMTP server hostname (e.g. smtp.gmail.com).",
            "port": "Usually 587 for TLS or 465 for SSL.",
            "use_tls": "Enable STARTTLS on the SMTP connection.",
            "username": "SMTP authentication username (often your email).",
            "password": "SMTP password or app-specific password.",
            "from_email": "Default From address for outgoing mail.",
        }


@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    form = SiteSettingAdminForm
    save_on_top = True
    fieldsets = (
        (
            "Brand & global",
            {
                "description": "Identity and messages shown across the storefront.",
                "fields": ("site_name", "logo", "header_text", "footer_text"),
            },
        ),
        (
            "Homepage — hero",
            {
                "description": "Top-of-home hero: headline, copy, CTAs, and images.",
                "fields": (
                    "hero_badge_text",
                    "hero_title",
                    "hero_title_highlight",
                    "hero_description",
                    "hero_cta_primary_label",
                    "hero_cta_primary_url",
                    "hero_cta_secondary_label",
                    "hero_cta_secondary_url",
                    "hero_background_image",
                    "hero_image",
                ),
            },
        ),
        (
            "Homepage — promo banner",
            {
                "description": "Large promotional block (e.g. category campaign).",
                "fields": (
                    "promo_title",
                    "promo_title_highlight",
                    "promo_description",
                    "promo_cta_label",
                    "promo_cta_url",
                    "homepage_banner_image",
                ),
            },
        ),
        (
            "Commerce & currency",
            {
                "fields": ("default_currency", "usd_to_bdt_rate"),
            },
        ),
        (
            "Theme colors",
            {
                "description": "Use the color picker or type a hex value (#rrggbb). Saved values apply as CSS variables on the frontend.",
                "fields": (
                    "primary_color",
                    "secondary_color",
                    "button_color",
                    "link_color",
                    "background_color",
                    "footer_color",
                ),
            },
        ),
        (
            "SEO (global defaults)",
            {
                "fields": ("seo_title", "seo_description", "seo_keywords"),
            },
        ),
    )

    def has_add_permission(self, request):
        return not SiteSetting.objects.exists()

    def has_view_permission(self, request, obj=None):
        return bool(request.user and request.user.is_active and request.user.is_staff)

    def has_change_permission(self, request, obj=None):
        return bool(request.user and request.user.is_active and request.user.is_staff)

    def render_change_form(self, request, context, add=False, change=False, form_url="", obj=None):
        context["show_save"] = True
        context["show_save_and_continue"] = True
        context["show_save_and_add_another"] = False
        return super().render_change_form(request, context, add, change, form_url, obj)


@admin.register(EmailSetting)
class EmailSettingAdmin(admin.ModelAdmin):
    form = EmailSettingAdminForm
    save_on_top = True
    fieldsets = (
        ("Status", {"fields": ("enabled",)}),
        (
            "SMTP server",
            {
                "fields": ("host", "port", "use_tls"),
            },
        ),
        (
            "Credentials",
            {
                "fields": ("username", "password", "from_email"),
            },
        ),
    )

    def has_add_permission(self, request):
        return not EmailSetting.objects.exists()

    def has_view_permission(self, request, obj=None):
        return bool(request.user and request.user.is_active and request.user.is_staff)

    def has_change_permission(self, request, obj=None):
        return bool(request.user and request.user.is_active and request.user.is_staff)

    def render_change_form(self, request, context, add=False, change=False, form_url="", obj=None):
        context["show_save"] = True
        context["show_save_and_continue"] = True
        context["show_save_and_add_another"] = False
        return super().render_change_form(request, context, add, change, form_url, obj)


@admin.register(CMSPage)
class CMSPageAdmin(admin.ModelAdmin):
    list_display = ("slug", "title", "is_active", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("slug", "title", "content")
    prepopulated_fields = {"slug": ("title",)}
    fieldsets = (
        (
            None,
            {
                "fields": ("slug", "title", "content", "is_active"),
            },
        ),
        (
            "SEO (this page)",
            {
                "classes": ("collapse",),
                "fields": ("seo_title", "seo_description"),
            },
        ),
    )
