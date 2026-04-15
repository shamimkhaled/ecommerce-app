import uuid

from django.conf import settings
from django.db import models


class Cart(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart",
        null=True,
        blank=True,
    )
    guest_token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "cart_cart"
        indexes = [
            models.Index(fields=["guest_token"]),
        ]

    def __str__(self):
        if self.user_id:
            return f"Cart user={self.user_id}"
        return f"Cart guest={self.guest_token}"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE, related_name="cart_items")
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = "cart_cartitem"
        unique_together = [("cart", "product")]
        indexes = [
            models.Index(fields=["cart", "product"]),
        ]
