import secrets
from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from apps.cart.models import Cart
from apps.payments.models import Payment
from apps.products.models import Product
from apps.siteconfig.services import send_dynamic_email

from .models import Coupon, Order, OrderItem, ShippingAddress, ShippingZone


def _primary_image_url(product: Product, request) -> str:
    im = (
        product.images.filter(is_primary=True).first()
        or product.images.order_by("sort_order", "id").first()
    )
    if im and im.image:
        u = im.image.url
        return request.build_absolute_uri(u) if request else u
    return ""


def _get_coupon(code: str | None):
    if not code:
        return None
    coupon = Coupon.objects.filter(code__iexact=code.strip(), is_active=True).first()
    if not coupon:
        raise ValueError("Invalid coupon code")
    now = timezone.now()
    if coupon.valid_from and now < coupon.valid_from:
        raise ValueError("Coupon is not active yet")
    if coupon.valid_to and now > coupon.valid_to:
        raise ValueError("Coupon has expired")
    if coupon.usage_limit is not None and coupon.used_count >= coupon.usage_limit:
        raise ValueError("Coupon usage limit reached")
    return coupon


def _shipping_cost(subtotal: Decimal, shipping: dict | None):
    if not shipping:
        return Decimal("0") if subtotal > Decimal("500") else Decimal("25")
    country = (shipping.get("country") or "").strip()
    city = (shipping.get("city") or "").strip()
    zone = (
        ShippingZone.objects.filter(is_active=True, country__iexact=country, city__iexact=city)
        .order_by("priority", "id")
        .first()
    )
    if not zone:
        zone = (
            ShippingZone.objects.filter(is_active=True, country__iexact=country, city="")
            .order_by("priority", "id")
            .first()
        )
    if zone:
        if zone.free_shipping_threshold and subtotal >= zone.free_shipping_threshold:
            return Decimal("0.00")
        return zone.delivery_charge
    return Decimal("0") if subtotal > Decimal("500") else Decimal("25")


def _compute_totals(cart: Cart, coupon_code: str | None = None, shipping: dict | None = None):
    subtotal = Decimal("0")
    for line in cart.items.select_related("product"):
        subtotal += line.product.price * line.quantity
    shipping_cost = _shipping_cost(subtotal, shipping)
    tax = (subtotal * Decimal("0.08")).quantize(Decimal("0.01"))
    discount = Decimal("0.00")
    coupon = _get_coupon(coupon_code)
    if coupon:
        if subtotal < coupon.min_subtotal:
            raise ValueError(f"Coupon requires minimum subtotal of {coupon.min_subtotal}")
        if coupon.discount_type == Coupon.DiscountType.PERCENT:
            discount = (subtotal * (coupon.value / Decimal("100"))).quantize(Decimal("0.01"))
        else:
            discount = coupon.value.quantize(Decimal("0.01"))
        if coupon.max_discount is not None:
            discount = min(discount, coupon.max_discount)
        discount = min(discount, subtotal)
    total = subtotal + shipping_cost + tax - discount
    if total < 0:
        total = Decimal("0.00")
    return subtotal, shipping_cost, tax, discount, total, coupon


@transaction.atomic
def create_order_from_cart(*, user, cart: Cart, shipping: dict, coupon_code: str | None = None, request=None) -> Order:
    if not cart.items.exists():
        raise ValueError("Cart is empty")

    for line in cart.items.select_related("product"):
        if line.product.stock < line.quantity:
            raise ValueError(f"Insufficient stock for {line.product.name}")

    subtotal, shipping_cost, tax_amount, discount_amount, total, coupon = _compute_totals(cart, coupon_code, shipping)

    order_number = f"ORD-{timezone.now().strftime('%Y')}-{secrets.token_hex(3).upper()}"
    order = Order.objects.create(
        user=user,
        order_number=order_number,
        status=Order.Status.PENDING,
        subtotal=subtotal,
        shipping_cost=shipping_cost,
        tax_amount=tax_amount,
        discount_amount=discount_amount,
        coupon_code=(coupon.code if coupon else ""),
        total=total,
    )

    ShippingAddress.objects.create(
        order=order,
        first_name=shipping["first_name"],
        last_name=shipping["last_name"],
        address_line1=shipping["address_line1"],
        city=shipping["city"],
        postal_code=shipping["postal_code"],
        country=shipping.get("country") or "US",
    )

    for line in cart.items.select_related("product"):
        p = line.product
        img_url = _primary_image_url(p, request)
        OrderItem.objects.create(
            order=order,
            product=p,
            product_name=p.name,
            product_slug=p.slug,
            quantity=line.quantity,
            unit_price=p.price,
            image_url=img_url,
        )
        Product.objects.filter(pk=p.pk).update(stock=p.stock - line.quantity)

    Payment.objects.create(
        order=order,
        method=Payment.Method.COD,
        status=Payment.Status.PENDING,
    )
    if coupon:
        coupon.used_count += 1
        coupon.save(update_fields=["used_count"])

    lines = []
    for item in order.items.all():
        lines.append(f"- {item.product_name} x {item.quantity} @ {item.unit_price} ({item.image_url})")
    send_dynamic_email(
        subject=f"Order placed: {order.order_number}",
        body="\n".join(
            [
                f"Order #{order.order_number}",
                f"Status: {order.get_status_display()}",
                f"Total: {order.total}",
                "",
                "Items:",
                *lines,
            ]
        ),
        to=[user.email],
    )

    cart.items.all().delete()
    return Order.objects.prefetch_related("items").select_related("payment").get(pk=order.pk)
