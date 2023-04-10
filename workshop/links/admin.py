"""
    Admin pages registrations
"""

from django.contrib import admin
from .models import Link, Tag, LinkTag


class LinkTagInline(admin.TabularInline):
    """
        Inline input for link-tag relationship
    """
    model = LinkTag


@admin.register(Link)
class LinkAdmin(admin.ModelAdmin):
    """
        Link model registration in Django admin
    """
    inlines = [LinkTagInline]


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    """
        Tag model registration in Django admin
    """
    pass
