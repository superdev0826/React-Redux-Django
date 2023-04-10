"""
    Django views for link application
"""
from django.shortcuts import render
from django.core import serializers
from .models import Link


def links_detail(request):
    """
        Links list
    """
    links = Link.objects.all()
    links_json = serializers.serialize('json', links)
    return render(
        request,
        'link_detail.html',
        context={
            'links': links_json
        })
