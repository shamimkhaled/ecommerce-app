from django.db.models import Avg, Count, Prefetch, Q
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.core.pagination import StandardResultsPagination

from .filters import ProductFilter
from .models import Category, Brand, HomepageSection, Product, ProductImage
from .serializers import (
    BrandSerializer,
    CategorySerializer,
    HomepageSectionSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)


def base_product_queryset():
    return (
        Product.objects.filter(is_active=True)
        .select_related("category", "brand")
        .prefetch_related(
            Prefetch(
                "images",
                queryset=ProductImage.objects.order_by("-is_primary", "sort_order", "id"),
            )
        )
        .annotate(
            rating_avg=Avg("reviews__rating", filter=Q(reviews__is_approved=True)),
            reviews_count=Count("reviews", filter=Q(reviews__is_approved=True), distinct=True),
        )
    )


class ProductViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    permission_classes = (AllowAny,)
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProductFilter
    lookup_field = "lookup"
    lookup_value_regex = "[^/]+"

    def get_queryset(self):
        qs = base_product_queryset()
        ordering = self.request.query_params.get("ordering")
        if ordering == "price":
            qs = qs.order_by("price", "id")
        elif ordering == "-price":
            qs = qs.order_by("-price", "id")
        elif ordering == "-created_at" or ordering == "latest":
            qs = qs.order_by("-created_at", "id")
        elif ordering in ("-popularity", "popularity", "-rating_avg"):
            qs = qs.order_by("-reviews_count", "-rating_avg", "id")
        elif ordering == "rating":
            qs = qs.order_by("-rating_avg", "-reviews_count", "id")
        else:
            qs = qs.order_by("-is_featured", "-created_at", "id")
        return qs

    def get_serializer_class(self):
        return ProductDetailSerializer if self.action == "retrieve" else ProductListSerializer

    def get_object(self):
        lookup = self.kwargs[self.lookup_field]
        qs = self.get_queryset()
        if str(lookup).isdigit():
            return get_object_or_404(qs, pk=int(lookup))
        return get_object_or_404(qs, slug=lookup)

    @action(detail=False, methods=["get"], url_path="featured")
    def featured(self, request):
        qs = base_product_queryset().filter(is_featured=True).order_by("-created_at")[:12]
        ser = ProductListSerializer(qs, many=True, context={"request": request})
        return Response(ser.data)

    @action(detail=False, methods=["get"], url_path="categories")
    def categories_list(self, request):
        data = CategorySerializer(Category.objects.all(), many=True, context={"request": request}).data
        names = ["All"] + [c["name"] for c in data]
        return Response({"results": data, "names": names})

    @action(detail=False, methods=["get"], url_path="compare")
    def compare(self, request):
        ids = [x.strip() for x in request.query_params.get("ids", "").split(",") if x.strip()]
        if not ids:
            return Response({"results": []})
        qs = self.get_queryset().filter(pk__in=ids)[:5]
        return Response({"results": ProductListSerializer(qs, many=True, context={"request": request}).data})


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (AllowAny,)
    lookup_field = "slug"


class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = (AllowAny,)
    lookup_field = "slug"


class HomepageSectionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = HomepageSectionSerializer
    permission_classes = (AllowAny,)
    lookup_field = "key"

    def get_queryset(self):
        pq = base_product_queryset().order_by("-is_featured", "-created_at")
        return HomepageSection.objects.filter(is_active=True).prefetch_related(
            Prefetch("products", queryset=pq)
        )
