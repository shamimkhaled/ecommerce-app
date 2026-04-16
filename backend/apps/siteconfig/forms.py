import re

from django import forms

from .models import SiteSetting


class ColorPickerWidget(forms.TextInput):
    """Hex color input widget (safe for editing/saving)."""

    def __init__(self, attrs=None):
        base = {
            "placeholder": "#2563eb",
            "style": "width: 8rem;",
            "title": "Use hex color like #2563eb",
        }
        if attrs:
            base.update(attrs)
        super().__init__(attrs=base)


class SiteSettingAdminForm(forms.ModelForm):
    COLOR_FIELDS = (
        "primary_color",
        "secondary_color",
        "button_color",
        "link_color",
        "background_color",
        "footer_color",
    )

    class Meta:
        model = SiteSetting
        fields = "__all__"
        widgets = {
            "primary_color": ColorPickerWidget,
            "secondary_color": ColorPickerWidget,
            "button_color": ColorPickerWidget,
            "link_color": ColorPickerWidget,
            "background_color": ColorPickerWidget,
            "footer_color": ColorPickerWidget,
        }
        help_texts = {
            "site_name": "Shown in the header and footer.",
            "logo": "Square or wide logo; PNG/SVG recommended.",
            "header_text": "Thin announcement bar above the main navigation.",
            "footer_text": "Short text/HTML-free blurb above copyright.",
            "hero_badge_text": "Small pill label above the hero headline.",
            "hero_title": "Main hero headline (first line).",
            "hero_title_highlight": "Gradient accent line under the headline.",
            "hero_description": "Supporting paragraph under the title.",
            "hero_image": "Large visual on the right (desktop) / below title (mobile).",
            "hero_background_image": "Optional full-width background behind the hero (overrides default gradient).",
            "hero_cta_primary_label": "Primary button label (e.g. Shop Collection).",
            "hero_cta_primary_url": "Path or URL for primary CTA (e.g. /products).",
            "hero_cta_secondary_label": "Secondary button label.",
            "hero_cta_secondary_url": "Path or URL for secondary CTA.",
            "promo_title": "Promo block — first line of the title.",
            "promo_title_highlight": "Promo title accent (second line, highlighted).",
            "promo_description": "Promo paragraph text.",
            "promo_cta_label": "Promo button text.",
            "promo_cta_url": "Promo button link (e.g. /products?category=Audio).",
            "homepage_banner_image": "Background image for the promo section.",
            "default_currency": "Default currency for new visitors (navbar can override per session).",
            "usd_to_bdt_rate": "Multiply USD prices by this rate when BDT is selected on the storefront.",
            "primary_color": "Brand primary; used for links and accents. Use picker or type hex (#rrggbb).",
            "secondary_color": "Secondary brand color.",
            "button_color": "Primary buttons and CTAs.",
            "link_color": "Inline links.",
            "background_color": "Page background (where applied).",
            "footer_color": "Footer background.",
            "seo_title": "Default HTML <title> when page has no specific title.",
            "seo_description": "Default meta description.",
            "seo_keywords": "Comma-separated keywords for meta keywords tag.",
        }

    def clean(self):
        cleaned = super().clean()
        for field in self.COLOR_FIELDS:
            value = (cleaned.get(field) or "").strip()
            if not value:
                continue
            if not value.startswith("#"):
                value = f"#{value}"
            if not re.fullmatch(r"#[0-9a-fA-F]{6}", value):
                self.add_error(field, "Use 6-digit hex color, e.g. #2563eb")
                continue
            cleaned[field] = value.lower()
        return cleaned
