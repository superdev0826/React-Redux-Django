from django.conf.urls import url, include
from django.urls import path
from django.views import generic
from rest_framework import routers

from . import views
from .api import LinkTagViewSet, LinkViewSet, TagViewSet, UserViewSet


# Routers provide a way of automatically determining the URL conf.
router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'links', LinkViewSet)
router.register(r'tags', TagViewSet)
router.register(r'linktags', LinkTagViewSet)


urlpatterns = [
    path('view2/',
         generic.TemplateView.as_view(template_name='view2.html')),
    path('api/', include(router.urls)),
    path('', views.links_detail)
]
