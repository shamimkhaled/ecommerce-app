from uuid import UUID

from django.utils import timezone

from .models import Cart


def get_or_create_cart_for_request(request):
    """
    Authenticated: user's cart.
    Guest: cart tied to X-Cart-Token UUID header.
    """
    user = request.user
    if user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=user, defaults={"guest_token": None})
        if cart.guest_token:
            cart.guest_token = None
            cart.save(update_fields=["guest_token", "updated_at"])
        return cart

    raw = request.headers.get("X-Cart-Token") or request.headers.get("x-cart-token")
    if raw:
        try:
            tid = UUID(str(raw))
        except ValueError:
            tid = None
        if tid:
            cart = Cart.objects.filter(user__isnull=True, guest_token=tid).first()
            if cart:
                return cart

    return Cart.objects.create(user=None)


def merge_guest_cart_into_user(guest_cart: Cart, user):
    """After login: merge guest cart lines into user's cart."""
    user_cart, _ = Cart.objects.get_or_create(user=user, defaults={"guest_token": None})
    if guest_cart.pk == user_cart.pk:
        return user_cart
    for item in guest_cart.items.select_related("product"):
        existing = user_cart.items.filter(product_id=item.product_id).first()
        if existing:
            existing.quantity += item.quantity
            existing.save(update_fields=["quantity"])
        else:
            user_cart.items.create(product_id=item.product_id, quantity=item.quantity)
    guest_cart.delete()
    user_cart.updated_at = timezone.now()
    user_cart.save(update_fields=["updated_at"])
    return user_cart
