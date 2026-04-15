from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Review(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews")
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE, related_name="reviews")
    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviews",
    )
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    is_approved = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = "reviews_review"
        unique_together = [("user", "product")]
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["product", "is_approved"]),
        ]

    def __str__(self):
        return f"{self.user_id} -> {self.product_id}: {self.rating}"
