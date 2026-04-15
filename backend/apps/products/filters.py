import django_filters
from django.db.models import Q

from .models import Product


class ProductFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(method="filter_category")
    brand = django_filters.CharFilter(method="filter_brand")
    price_min = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    price_max = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    search = django_filters.CharFilter(method="filter_search")
    featured = django_filters.BooleanFilter(field_name="is_featured")
    trending = django_filters.BooleanFilter(field_name="is_trending")

    class Meta:
        model = Product
        fields = ["category", "brand", "price_min", "price_max", "search", "featured", "trending"]

    def filter_category(self, queryset, name, value):
        if not value or value.lower() == "all":
            return queryset
        return queryset.filter(Q(category__slug__iexact=value) | Q(category__name__iexact=value))

    def filter_brand(self, queryset, name, value):
        if not value:
            return queryset
        names = [v.strip() for v in str(value).split(",") if v.strip()]
        if not names:
            return queryset
        q = Q()
        for n in names:
            q |= Q(brand__name__iexact=n) | Q(brand__slug__iexact=n)
        return queryset.filter(q)

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(Q(name__icontains=value) | Q(description__icontains=value))
