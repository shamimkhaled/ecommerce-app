from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "admin")
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None
    email = models.EmailField("email address", unique=True, db_index=True)
    name = models.CharField(max_length=255)
    role = models.CharField(
        max_length=20,
        choices=[("customer", "Customer"), ("admin", "Admin")],
        default="customer",
        db_index=True,
    )
    avatar = models.ImageField(upload_to="users/avatars/", blank=True, null=True)
    phone = models.CharField(max_length=32, blank=True)
    address = models.TextField(blank=True)
    preferences = models.JSONField(default=dict, blank=True)
    google_sub = models.CharField(max_length=128, blank=True, db_index=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    class Meta:
        db_table = "users_user"
        ordering = ["-date_joined"]
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["role"]),
        ]

    def __str__(self):
        return self.email

    @property
    def frontend_role(self) -> str:
        if self.is_superuser or self.is_staff or self.role == "admin":
            return "admin"
        return "user"


class WishlistItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="wishlist_items")
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE, related_name="wishlisted_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "users_wishlistitem"
        unique_together = [("user", "product")]
        ordering = ["-created_at"]


class Notification(models.Model):
    class Type(models.TextChoices):
        ORDER_PLACED = "order_placed", "Order placed"
        ORDER_SHIPPED = "order_shipped", "Order shipped"
        ORDER_DELIVERED = "order_delivered", "Order delivered"
        ORDER_UPDATED = "order_updated", "Order updated"
        SYSTEM = "system", "System"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=40, choices=Type.choices, default=Type.SYSTEM, db_index=True)
    is_read = models.BooleanField(default=False, db_index=True)
    order = models.ForeignKey("orders.Order", null=True, blank=True, on_delete=models.CASCADE, related_name="notifications")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = "users_notification"
        ordering = ["-created_at"]
