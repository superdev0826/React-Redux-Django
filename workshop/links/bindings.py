"""
   Bindings module
"""
# pylint: disable=missing-docstring

from channels.binding.websockets import WebsocketBinding

from .models import Link, Tag, LinkTag


class LinkBinding(WebsocketBinding):
    model = Link
    stream = 'links'
    fields = ['id', 'name', 'url', 'pending',
              'description', 'tags', 'user']

    @classmethod
    def group_names(cls, instance):
        return ['link-updates']

    def has_permission(self, user, action, pk):
        return True


class LinkTagBinding(WebsocketBinding):
    model = LinkTag
    stream = 'linktags'
    fields = ['id', 'link', 'tag']

    @classmethod
    def group_names(cls, instance):
        return ['linktags-updates']

    def has_permission(self, user, action, pk):
        return True


class TagBinding(WebsocketBinding):
    model = Tag
    stream = 'tags'
    fields = ['id', 'name', 'description', 'user']

    @classmethod
    def group_names(cls, instance):
        return ['tags-updates']

    def has_permission(self, user, action, pk):
        return True
