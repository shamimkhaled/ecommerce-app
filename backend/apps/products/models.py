from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True, db_index=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="categories/", blank=True, null=True)

    class Meta:
        db_table = "catalog_category"
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)[:140]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Brand(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True, db_index=True)

    class Meta:
        db_table = "catalog_brand"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)[:140]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=280, unique=True, db_index=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2, db_index=True)
    discount = models.PositiveSmallIntegerField(
        default=0, help_text="Percent off for display (strikethrough uses price * (1 + discount/100))."
    )
    stock = models.PositiveIntegerField(default=0, db_index=True)
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="products", db_index=True
    )
    brand = models.ForeignKey(Brand, on_delete=models.PROTECT, related_name="products", db_index=True)
    is_featured = models.BooleanField(default=False, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    is_trending = models.BooleanField(default=False, db_index=True)
    specs = models.JSONField(default=dict, blank=True)
    meta_title = models.CharField(max_length=255, blank=True)
    meta_description = models.TextField(blank=True)
    meta_keywords = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "catalog_product"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["category", "is_active"]),
            models.Index(fields=["brand", "is_active"]),
            models.Index(fields=["-created_at"]),
            models.Index(fields=["price"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name)[:200]
            self.slug = base
            n = 1
            while Product.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{base}-{n}"
                n += 1
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="products/%Y/%m/")
    alt_text = models.CharField(max_length=255, blank=True)
    sort_order = models.PositiveSmallIntegerField(default=0)
    is_primary = models.BooleanField(default=False)

    class Meta:
        db_table = "catalog_productimage"
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"{self.product_id}: {self.image.name}"


class HomepageSection(models.Model):
    """Curated blocks for featured / trending product lists (admin-driven)."""

    key = models.SlugField(max_length=64, unique=True)
    title = models.CharField(max_length=255)
    products = models.ManyToManyField(Product, blank=True, related_name="homepage_sections")
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "catalog_homepagesection"
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.title
