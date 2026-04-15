from rest_framework import serializers

from .models import Brand, Category, HomepageSection, Product, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "image")

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url"):
            u = obj.image.url
            return request.build_absolute_uri(u) if request else u
        return ""


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ("id", "name", "slug")


class ProductImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ("id", "url", "alt_text", "sort_order", "is_primary")

    def get_url(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url"):
            u = obj.image.url
            if request:
                return request.build_absolute_uri(u)
            return u
        return None


class ProductListSerializer(serializers.ModelSerializer):
    """Shape aligned with React `Product` type for listings and cards."""

    id = serializers.CharField(read_only=True, source="pk")
    category = serializers.CharField(source="category.name", read_only=True)
    brand = serializers.CharField(source="brand.name", read_only=True)
    image = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    reviewsCount = serializers.SerializerMethodField()
    isFeatured = serializers.BooleanField(source="is_featured", read_only=True)
    specs = serializers.JSONField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "meta_title",
            "meta_description",
            "meta_keywords",
            "price",
            "category",
            "image",
            "images",
            "rating",
            "reviewsCount",
            "stock",
            "brand",
            "specs",
            "isFeatured",
            "discount",
        )

    def get_rating(self, obj):
        v = getattr(obj, "rating_avg", None)
        if v is not None and float(v) > 0:
            return round(float(v), 2)
        return 0.0

    def get_reviewsCount(self, obj):
        return int(getattr(obj, "reviews_count", None) or 0)

    def get_image(self, obj):
        request = self.context.get("request")
        im = next(iter(obj.images.all()), None)
        if im and im.image:
            u = im.image.url
            return request.build_absolute_uri(u) if request else u
        return ""

    def get_images(self, obj):
        request = self.context.get("request")
        out = []
        for im in obj.images.all():
            if im.image:
                u = im.image.url
                out.append(request.build_absolute_uri(u) if request else u)
        return out


class ProductDetailSerializer(ProductListSerializer):
    pass


class HomepageSectionSerializer(serializers.ModelSerializer):
    products = ProductListSerializer(many=True, read_only=True)

    class Meta:
        model = HomepageSection
        fields = ("key", "title", "products")
