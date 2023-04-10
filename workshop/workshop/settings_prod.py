# pylint: disable=wildcard-import,unused-wildcard-import

"""
Django production settings for workshop project.

For more information on this file, see
https://docs.djangoproject.com/en/2.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.0/ref/settings/
"""

import os
import socket

from workshop.settings import *

DEBUG = False
TEMPLATE_DEBUG = False

SECRET_KEY = os.getenv(
    'SECRET_KEY',
    'kl*@mt86$rdllg+$d633#ijwkkc49^k-hw5yxfsbtn*rdq1=l)')

ALLOWED_HOSTS = [os.getenv('APP_DNS', 'localhost'), socket.gethostname()]

WEBPACK_LOADER = {
    'DEFAULT': {
        'BUNDLE_DIR_NAME': 'bundles/prod/',  # end with slash
        'STATS_FILE': os.path.join(
            BASE_DIR, 'front', 'webpack-stats-prod.json'),
    }
}

# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': os.getenv('POSTGRES_DB', 'workshop'),
        'USER': os.getenv('POSTGRES_USER', 'workshop'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'secret'),
        'HOST': os.getenv('POSTGRES_HOST', 'localhost'),
        'PORT': os.getenv('POSTGRES_PORT', '5432'),
        'OPTIONS': {
            'sslmode': os.environ.get("POSTGRES_OPTIONS_SSL", "prefer"),
        },
    }
}

REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': (
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly'
    ],
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    )
}

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'asgi_redis.RedisChannelLayer',
        'CONFIG': {
            'hosts': [(
                os.getenv('REDIS_HOST', 'redis'),
                int(os.getenv('REDIS_PORT', '6379')),
            )],
        },
        'ROUTING': 'workshop.routing.channel_routing',
    }
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
        'logservices': {
            'format': '[%(asctime)s] [%(levelname)s] %(message)s'
        }
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple'
        },
        'file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.getenv(
                'LOG_FILE',
                '/var/log/workshop/workshop.log'
            ),
            'maxBytes': 1024*1024*10,
            'backupCount': 10,
            'formatter': 'logservices'
        }
    },
    'loggers': {
        'workshop': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True
        },
        'django.channels': {
            'handlers': ['file'],
            'level': 'WARNING',
            'propagate': True
        },
        'django.request': {
            'handlers': ['file'],
            'level': 'WARNING',
            'propagate': True
        },
        'django': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': True
        }
    }
}
