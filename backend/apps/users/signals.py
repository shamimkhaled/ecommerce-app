from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.orders.models import Order
from apps.siteconfig.services import send_dynamic_email

from .models import Notification


@receiver(post_save, sender=Order)
def order_notification_on_change(sender, instance: Order, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.user,
            order=instance,
            type=Notification.Type.ORDER_PLACED,
            title=f"Order {instance.order_number} placed",
            message="Your order has been placed successfully.",
        )
        return
    if instance.status == Order.Status.SHIPPED:
        Notification.objects.create(
            user=instance.user,
            order=instance,
            type=Notification.Type.ORDER_SHIPPED,
            title=f"Order {instance.order_number} shipped",
            message="Your order is on the way.",
        )
        send_dynamic_email(
            subject=f"Order shipped: {instance.order_number}",
            body=f"Your order {instance.order_number} has been shipped.",
            to=[instance.user.email],
        )
    elif instance.status == Order.Status.DELIVERED:
        Notification.objects.create(
            user=instance.user,
            order=instance,
            type=Notification.Type.ORDER_DELIVERED,
            title=f"Order {instance.order_number} delivered",
            message="Your order has been delivered.",
        )
        send_dynamic_email(
            subject=f"Order delivered: {instance.order_number}",
            body=f"Your order {instance.order_number} has been delivered.",
            to=[instance.user.email],
        )
