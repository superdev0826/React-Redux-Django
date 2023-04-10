"""
    Utils module for link application
"""
import difflib
from .constant import SIMILAR_RATIO


def is_similar(source, target):
    """
        Return if source string is similar to target string
    """
    seq = difflib.SequenceMatcher(a=source, b=target)
    ratio = seq.ratio()
    return ratio >= SIMILAR_RATIO
