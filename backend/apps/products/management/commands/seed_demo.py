from decimal import Decimal
from io import BytesIO

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from PIL import Image

from apps.products.models import Brand, Category, HomepageSection, Product, ProductImage


def _jpeg(w: int, h: int, color: tuple[int, int, int]) -> ContentFile:
    buf = BytesIO()
    Image.new("RGB", (w, h), color).save(buf, format="JPEG", quality=85)
    return ContentFile(buf.getvalue(), name=f"seed_{w}x{h}.jpg")


class Command(BaseCommand):
    help = "Seed categories, brands, and sample products (aligned with frontend mock data)."

    def handle(self, *args, **options):
        cats = {}
        for name in ("Laptops", "Smartphones", "Audio", "Tablets", "Accessories", "Gaming"):
            c, _ = Category.objects.get_or_create(name=name, defaults={"slug": ""})
            if not c.slug:
                c.save()
            cats[name] = c

        brands = {}
        for name in ("Apple", "Sony", "Samsung"):
            b, _ = Brand.objects.get_or_create(name=name, defaults={"slug": ""})
            if not b.slug:
                b.save()
            brands[name] = b

        demo = [
            {
                "name": 'MacBook Pro 14"',
                "description": "The most powerful MacBook Pro ever. With the blazing-fast M3 Pro or M3 Max chip.",
                "price": Decimal("1999.00"),
                "category": cats["Laptops"],
                "brand": brands["Apple"],
                "stock": 50,
                "is_featured": True,
                "discount": 10,
                "specs": {
                    "Display": "14.2-inch Liquid Retina XDR",
                    "Processor": "Apple M3 Pro chip",
                    "Memory": "18GB Unified Memory",
                    "Storage": "512GB SSD",
                },
            },
            {
                "name": "iPhone 15 Pro",
                "description": "Titanium design. A17 Pro chip. A customizable Action button.",
                "price": Decimal("999.00"),
                "category": cats["Smartphones"],
                "brand": brands["Apple"],
                "stock": 30,
                "is_featured": True,
                "discount": 0,
                "specs": {
                    "Display": "6.1-inch Super Retina XDR",
                    "Processor": "A17 Pro chip",
                    "Camera": "48MP Main | Ultra Wide",
                    "Battery": "Up to 23 hours video",
                },
            },
            {
                "name": "Sony WH-1000XM5",
                "description": "Industry-leading noise canceling headphones with exceptional sound quality.",
                "price": Decimal("399.00"),
                "category": cats["Audio"],
                "brand": brands["Sony"],
                "stock": 100,
                "is_featured": True,
                "discount": 0,
                "specs": {
                    "Battery Life": "Up to 30 hours",
                    "Noise Canceling": "Dual Noise Sensor",
                    "Connectivity": "Bluetooth 5.2",
                    "Weight": "250g",
                },
            },
            {
                "name": "Samsung Galaxy S24 Ultra",
                "description": "The ultimate Galaxy smartphone with built-in S Pen and AI features.",
                "price": Decimal("1299.00"),
                "category": cats["Smartphones"],
                "brand": brands["Samsung"],
                "stock": 45,
                "is_featured": False,
                "discount": 15,
                "specs": {
                    "Display": "6.8-inch Dynamic AMOLED 2X",
                    "Processor": "Snapdragon 8 Gen 3",
                    "Camera": "200MP Main",
                    "Battery": "5000mAh",
                },
            },
        ]

        for row in demo:
            p, created = Product.objects.update_or_create(
                name=row["name"],
                defaults={
                    "description": row["description"],
                    "price": row["price"],
                    "discount": row["discount"],
                    "stock": row["stock"],
                    "category": row["category"],
                    "brand": row["brand"],
                    "is_featured": row["is_featured"],
                    "is_active": True,
                    "specs": row["specs"],
                },
            )
            if created or not p.images.exists():
                p.images.all().delete()
                img = ProductImage(
                    product=p,
                    alt_text=p.name,
                    sort_order=0,
                    is_primary=True,
                )
                img.image.save(f"p{p.pk}_primary.jpg", _jpeg(800, 1000, (40, 40, 55)))
                img.save()

        sec, _ = HomepageSection.objects.get_or_create(
            key="featured",
            defaults={"title": "Featured Products", "is_active": True, "sort_order": 0},
        )
        sec.products.set(Product.objects.filter(is_featured=True))

        self.stdout.write(self.style.SUCCESS("Demo catalog seeded."))
