"""
ASGI config for workshop project.
"""

import os

from channels.asgi import get_channel_layer

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "workshop.settings")

# pylint: disable=invalid-name
channel_layer = get_channel_layer()
