from django.db import models


class Payment(models.Model):
    class Method(models.TextChoices):
        COD = "cod", "Cash on Delivery"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"

    order = models.OneToOneField("orders.Order", on_delete=models.CASCADE, related_name="payment")
    method = models.CharField(max_length=20, choices=Method.choices, default=Method.COD)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payments_payment"
