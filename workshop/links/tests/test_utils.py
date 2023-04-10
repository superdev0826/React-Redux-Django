"""
    Tests for utils module
"""
from unittest.mock import patch
import pytest

from links.utils import is_similar


def test_is_similar_should_return_true_when_strings_are_similars():
    assert is_similar('python', 'pytohn')


def test_is_similar_should_return_false_when_strings_not_are_similars():
    assert not is_similar('python', 'javascript')


@pytest.mark.unit_tests
@patch('difflib.SequenceMatcher')
def test_is_similar_should_call_SequenceMatcher(sequence_matcher_mock):
    sequence_matcher_mock().ratio.return_value = 4
    is_similar('python', 'pytohn')
    assert sequence_matcher_mock.called
    sequence_matcher_mock.assert_called_with(a='python', b='pytohn')
