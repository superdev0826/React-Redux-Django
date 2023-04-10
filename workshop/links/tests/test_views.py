from django_dynamic_fixture import G
from django.core import serializers

import pytest

from links.models import Link


@pytest.mark.client
@pytest.mark.django_db
def test_link_detail_view_without_links(client):
    response = client.get('/links/')
    assert 200 == response.status_code
    assert str([]) == response.context[-1]['links']


@pytest.mark.client
@pytest.mark.django_db
def test_link_detail_view_with_links(client):
    link_workshop = G(
        Link,
        name='Gitlab with workshop',
        url='https://gitlab.com/FedeG/django-react-workshop/')
    links_json = serializers.serialize('json', [link_workshop])
    response = client.get('/links/')
    assert 200 == response.status_code
    assert links_json == response.context[-1]['links']
