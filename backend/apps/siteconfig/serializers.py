from rest_framework import serializers

from .models import CMSPage, SiteSetting


class SiteSettingSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    hero_image_url = serializers.SerializerMethodField()
    homepage_banner_image_url = serializers.SerializerMethodField()

    class Meta:
        model = SiteSetting
        fields = (
            "site_name",
            "logo_url",
            "header_text",
            "footer_text",
            "hero_image_url",
            "homepage_banner_image_url",
            "primary_color",
            "secondary_color",
            "button_color",
            "link_color",
            "background_color",
            "footer_color",
            "seo_title",
            "seo_description",
            "seo_keywords",
            "default_currency",
            "usd_to_bdt_rate",
        )

    def get_logo_url(self, obj):
        request = self.context.get("request")
        if obj.logo and hasattr(obj.logo, "url"):
            return request.build_absolute_uri(obj.logo.url) if request else obj.logo.url
        return ""

    def _url(self, request, f):
        if f and hasattr(f, "url"):
            return request.build_absolute_uri(f.url) if request else f.url
        return ""

    def get_hero_image_url(self, obj):
        return self._url(self.context.get("request"), obj.hero_image)

    def get_homepage_banner_image_url(self, obj):
        return self._url(self.context.get("request"), obj.homepage_banner_image)


class CMSPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CMSPage
        fields = ("slug", "title", "content", "seo_title", "seo_description")
