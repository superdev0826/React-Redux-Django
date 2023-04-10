"""
    Api module with serializers and viewsets for models
"""
# pylint: disable=too-many-ancestors
# pylint: disable=missing-docstring

from django.contrib.auth.models import User
from rest_framework import serializers, viewsets

from .models import Link, Tag, LinkTag


# Serializers define the API representation.
class LinkTagSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = LinkTag
        fields = ('url', 'link', 'tag')


class LinkSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Link
        fields = ('id', 'url', 'name', 'url', 'pending',
                  'description', 'tags', 'user')


class TagSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'url', 'name', 'description', 'user')


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username', 'email', 'is_staff')


# ViewSets define the view behavior.
class LinkTagViewSet(viewsets.ModelViewSet):
    queryset = LinkTag.objects.all()
    serializer_class = LinkTagSerializer


class LinkViewSet(viewsets.ModelViewSet):
    queryset = Link.objects.all()
    serializer_class = LinkSerializer


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
