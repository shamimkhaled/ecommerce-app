from django.db import models


class SiteSetting(models.Model):
    class Currency(models.TextChoices):
        USD = "USD", "USD"
        BDT = "BDT", "BDT"

    site_name = models.CharField(max_length=120, default="ElectroHub")
    logo = models.ImageField(upload_to="site/logo/", blank=True, null=True)
    header_text = models.CharField(max_length=255, blank=True)
    footer_text = models.TextField(blank=True)
    hero_image = models.ImageField(upload_to="site/hero/", blank=True, null=True)
    hero_background_image = models.ImageField(
        upload_to="site/hero_bg/",
        blank=True,
        null=True,
        help_text="Optional full-width hero background (behind text).",
    )
    hero_badge_text = models.CharField(max_length=120, blank=True, default="Next Gen Technology")
    hero_title = models.CharField(max_length=255, blank=True, default="The Future")
    hero_title_highlight = models.CharField(max_length=255, blank=True, default="of Innovation.")
    hero_description = models.TextField(
        blank=True,
        default="Experience the next evolution of gadgets. Precision engineered, beautifully designed, and built for the modern world.",
    )
    hero_cta_primary_label = models.CharField(max_length=80, blank=True, default="Shop Collection")
    hero_cta_primary_url = models.CharField(max_length=255, blank=True, default="/products")
    hero_cta_secondary_label = models.CharField(max_length=80, blank=True, default="Explore Categories")
    hero_cta_secondary_url = models.CharField(max_length=255, blank=True, default="/products")
    promo_title = models.CharField(max_length=255, blank=True, default="Immersive")
    promo_title_highlight = models.CharField(max_length=255, blank=True, default="Sound Experience.")
    promo_description = models.TextField(
        blank=True,
        default="Get up to 30% off on all Sony and Bose headphones this week. Experience audio like never before.",
    )
    promo_cta_label = models.CharField(max_length=120, blank=True, default="Shop Audio Deals")
    promo_cta_url = models.CharField(max_length=255, blank=True, default="/products?category=Audio")
    homepage_banner_image = models.ImageField(upload_to="site/banner/", blank=True, null=True)
    primary_color = models.CharField(max_length=16, default="#2563eb")
    secondary_color = models.CharField(max_length=16, default="#4f46e5")
    button_color = models.CharField(max_length=16, default="#2563eb")
    link_color = models.CharField(max_length=16, default="#2563eb")
    background_color = models.CharField(max_length=16, default="#ffffff")
    footer_color = models.CharField(max_length=16, default="#0f172a")
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.TextField(blank=True)
    seo_keywords = models.CharField(max_length=500, blank=True)
    default_currency = models.CharField(max_length=3, choices=Currency.choices, default=Currency.USD)
    usd_to_bdt_rate = models.DecimalField(max_digits=10, decimal_places=2, default=120.00)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "siteconfig_sitesetting"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def __str__(self):
        return "Site Settings"

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class EmailSetting(models.Model):
    host = models.CharField(max_length=255, blank=True)
    port = models.PositiveIntegerField(default=587)
    use_tls = models.BooleanField(default=True)
    username = models.CharField(max_length=255, blank=True)
    password = models.CharField(max_length=255, blank=True)
    from_email = models.EmailField(blank=True)
    enabled = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "siteconfig_emailsetting"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class CMSPage(models.Model):
    slug = models.SlugField(max_length=80, unique=True)
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "siteconfig_cmspage"
        ordering = ["slug"]
