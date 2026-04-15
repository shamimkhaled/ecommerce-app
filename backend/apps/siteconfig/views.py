from django.shortcuts import get_object_or_404
from rest_framework import permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CMSPage, SiteSetting
from .serializers import CMSPageSerializer, SiteSettingSerializer


class SiteSettingView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        obj = SiteSetting.load()
        return Response(SiteSettingSerializer(obj, context={"request": request}).data)


class CMSPageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CMSPage.objects.filter(is_active=True)
    serializer_class = CMSPageSerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = "slug"
