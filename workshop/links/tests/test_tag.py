"""
    Tests for Tag model
"""
from unittest.mock import patch
from django_dynamic_fixture import G

import pytest

from links.models import Tag


@pytest.mark.django_db
def test_get_similars_should_omit_self():
    tag_python = G(Tag, name='python')
    assert tag_python.get_similars() == []


@pytest.mark.django_db
def test_get_similars_should_return_similars():
    tag_python = G(Tag, name='python')
    tag_pytohn = G(Tag, name='pytohn')
    tag_pyton = G(Tag, name='pyton')
    tag_ypthon = G(Tag, name='ypthon')
    assert tag_python.get_similars() == [tag_pytohn, tag_pyton, tag_ypthon]


@pytest.mark.django_db
def test_get_similars_should_not_return_strings_with_differences():
    tag_python = G(Tag, name='python')
    G(Tag, name='react')
    G(Tag, name='javascript')
    assert tag_python.get_similars() == []


@pytest.mark.django_db
@pytest.mark.unit_tests
@patch('links.models.is_similar')
def test_get_similars_should_call_is_similar(similar_mock):
    tag = G(Tag, name='python')
    G(Tag, name='python2')
    tag.get_similars()
    assert similar_mock.called


@pytest.mark.django_db
@pytest.mark.unit_tests
@patch('links.models.is_similar')
def test_get_similars_should_call_is_similar_will_all_other_tags(similar_mock):
    tag_python = G(Tag, name='python')
    tag_python2 = G(Tag, name='python2')
    tag_python3 = G(Tag, name='python3')
    tag_python.get_similars()
    assert similar_mock.called
    assert similar_mock.call_count == 2
    similar_mock.assert_any_call(tag_python.name, tag_python2.name)
    similar_mock.assert_any_call(tag_python.name, tag_python3.name)
