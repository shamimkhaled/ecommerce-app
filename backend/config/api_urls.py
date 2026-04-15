from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.cart.views import CartViewSet
from apps.orders.views import CheckoutView, CouponPreviewView, OrderViewSet
from apps.products.views import BrandViewSet, CategoryViewSet, HomepageSectionViewSet, ProductViewSet
from apps.reviews.views import ProductReviewEligibilityView, ProductReviewListCreateView
from apps.siteconfig.views import CMSPageViewSet, SiteSettingView
from apps.users import urls as user_urls

router = DefaultRouter()
router.register(r"products", ProductViewSet, basename="product")
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"brands", BrandViewSet, basename="brand")
router.register(r"homepage-sections", HomepageSectionViewSet, basename="homepage-section")
router.register(r"cart", CartViewSet, basename="cart")
router.register(r"orders", OrderViewSet, basename="order")
router.register(r"pages", CMSPageViewSet, basename="cms-page")

urlpatterns = [
    path("auth/", include(user_urls)),
    path("orders/checkout/", CheckoutView.as_view(), name="orders-checkout"),
    path("orders/coupon-preview/", CouponPreviewView.as_view(), name="orders-coupon-preview"),
    path("products/<str:lookup>/reviews/", ProductReviewListCreateView.as_view(), name="product-reviews"),
    path("products/<str:lookup>/reviews/eligibility/", ProductReviewEligibilityView.as_view(), name="product-reviews-eligibility"),
    path("site/settings/", SiteSettingView.as_view(), name="site-settings"),
    path("", include(router.urls)),
]
