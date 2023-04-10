# Step 17: Production

[Back to Step 16](/en/step16_add_redux)

In this step, we will create a production server with the application
To understand this step we first have to keep in mind how this project works with Django and React.

For production we will only have Django server working, since the js generated with React will be used as static files.

## Configure Django production server

#### New dependencies

We are going to add two new dependencies:

In the `requirements.txt` we will add:

```conf
asgi-redis==1.4.3
psycopg2-binary==2.7.6.1
```

- **asgi-redis**: this dependence is for `redis` (save tasks)

- **psycopg2-binary**: this dependence is for use `postgres` database

#### Create a new settings for production

We will create a new settings file: `settings_prod.py` in the `workshop/workshop` folder (the same as the `settings.py` we use in development)

In that files we will put the production settings from the configurations we already have (importing the `settings.py`):

```python
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
import asgi_redis

# Import dev settings
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
```

##### Important details:

- **DEBUG** and **DEBUG_TEMPLATES**: they will be false since production does not debug the code
- **os.getenv**: we will use environment variables to configure a `.env` file or variables from our console
- **ALLOWED_HOSTS**: we specify from which domain this application can be accessed
- **WEBPACK_LOADER**: we use the webpack production stats
- **DATABASES**: we use a database (in this case postgres)
- **REST_FRAMEWORK**: the api will only be accessible in read mode for non-logged-in users and will answer JSON by default
- **CHANNEL_LAYERS**: for `django-channels` we will use a` redis`
- **LOGGING**; we will use a log configuration according to production

#### How to use that settings?

To use the `settings_prod.py` that we put together, we first have to put together an `asgi.py` file since we are going to be using `redis` to be able to shoot actions and glue tasks.

In the `workshop/workshop/asgi.py` file we will put:

```python
"""
ASGI config for workshop project.
"""

import os

from channels.asgi import get_channel_layer

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "workshop.settings")

# pylint: disable=invalid-name
channel_layer = get_channel_layer()
```

In this case we will leave the original `settings.py` as the default value of `DJANGO_SETTINGS_MODULE` as it could be used and when we plan to use the application in production mode we only have to configure that environment variable with the value `workshop.settings_prod`.

## Generate React js files to use on the production server

If we see the files that we have in the `workshop/front` folder we can see one that is `webpack.prod.config.js`.
This file is armed to generate the final bundles of js that will be used in production.

To create these bundles we will do:

```javascript
cd workshop/front
webpack --config webpack.prod.config.js
```

This command does the `Dockerfile` that we already have, so it is not necessary to run it by hand unless you do not use **docker**.

## Full server

To begin with, you have to understand that while this workshop gives a way, there are many different ways to do it.
In this case we will use `docker-compose` that allows us to control several services and link them together.

#### Infrastructure

Before detailing the code and files, let's talk about the infrastructure we are going to use:

- 2 containers with python, one will listen to the requests of the web and another will perform the tasks (for this we will use a tool called `daphne`).

- 2 containers with nginx, one could simply be used but to make easier the implementation of the domain and ports, we will use one with a nginx configured by us and another one with `nginx-proxy` which is a tool that allows us to work easily with The subject domains and ports.

- 1 container with postgres, this is the database that we will use

- 1 container with redis

Also to ensure that the data is saved we will use volumes, which are:

- **/srv/deploys/workshopdata/static**: for the static files of our application

- **/srv/deploys/workshopdata/postgres**: for database files

#### Base files:

We will create files for deploy in the `deploy/docker` folder.

In this folder we will create two folders: `nginx` and `scripts`

#### Scripts

This folder will have the scripts that we will use in our `docker-compose`.

One is going to be the application startup script and another is going to be a script that is used to wait for the database to be running before running the other script.

In the `deploy/docker/scripts/wait-for-it.sh` file:

```bash
#!/usr/bin/env bash
#   Use this script to test if a given TCP host/port are available

cmdname=$(basename $0)

echoerr() { if [[ $QUIET -ne 1 ]]; then echo "$@" 1>&2; fi }

usage()
{
    cat << USAGE >&2
Usage:
    $cmdname host:port [-s] [-t timeout] [-- command args]
    -h HOST | --host=HOST       Host or IP under test
    -p PORT | --port=PORT       TCP port under test
                                Alternatively, you specify the host and port as host:port
    -s | --strict               Only execute subcommand if the test succeeds
    -q | --quiet                Don't output any status messages
    -t TIMEOUT | --timeout=TIMEOUT
                                Timeout in seconds, zero for no timeout
    -- COMMAND ARGS             Execute command with args after the test finishes
USAGE
    exit 1
}

wait_for()
{
    if [[ $TIMEOUT -gt 0 ]]; then
        echoerr "$cmdname: waiting $TIMEOUT seconds for $HOST:$PORT"
    else
        echoerr "$cmdname: waiting for $HOST:$PORT without a timeout"
    fi
    start_ts=$(date +%s)
    while :
    do
        if [[ $ISBUSY -eq 1 ]]; then
            nc -z $HOST $PORT
            result=$?
        else
            (echo > /dev/tcp/$HOST/$PORT) >/dev/null 2>&1
            result=$?
        fi
        if [[ $result -eq 0 ]]; then
            end_ts=$(date +%s)
            echoerr "$cmdname: $HOST:$PORT is available after $((end_ts - start_ts)) seconds"
            break
        fi
        sleep 1
    done
    return $result
}

wait_for_wrapper()
{
    # In order to support SIGINT during timeout: http://unix.stackexchange.com/a/57692
    if [[ $QUIET -eq 1 ]]; then
        timeout $BUSYTIMEFLAG $TIMEOUT $0 --quiet --child --host=$HOST --port=$PORT --timeout=$TIMEOUT &
    else
        timeout $BUSYTIMEFLAG $TIMEOUT $0 --child --host=$HOST --port=$PORT --timeout=$TIMEOUT &
    fi
    PID=$!
    trap "kill -INT -$PID" INT
    wait $PID
    RESULT=$?
    if [[ $RESULT -ne 0 ]]; then
        echoerr "$cmdname: timeout occurred after waiting $TIMEOUT seconds for $HOST:$PORT"
    fi
    return $RESULT
}

# process arguments
while [[ $# -gt 0 ]]
do
    case "$1" in
        *:* )
        hostport=(${1//:/ })
        HOST=${hostport[0]}
        PORT=${hostport[1]}
        shift 1
        ;;
        --child)
        CHILD=1
        shift 1
        ;;
        -q | --quiet)
        QUIET=1
        shift 1
        ;;
        -s | --strict)
        STRICT=1
        shift 1
        ;;
        -h)
        HOST="$2"
        if [[ $HOST == "" ]]; then break; fi
        shift 2
        ;;
        --host=*)
        HOST="${1#*=}"
        shift 1
        ;;
        -p)
        PORT="$2"
        if [[ $PORT == "" ]]; then break; fi
        shift 2
        ;;
        --port=*)
        PORT="${1#*=}"
        shift 1
        ;;
        -t)
        TIMEOUT="$2"
        if [[ $TIMEOUT == "" ]]; then break; fi
        shift 2
        ;;
        --timeout=*)
        TIMEOUT="${1#*=}"
        shift 1
        ;;
        --)
        shift
        CLI="$@"
        break
        ;;
        --help)
        usage
        ;;
        *)
        echoerr "Unknown argument: $1"
        usage
        ;;
    esac
done

if [[ "$HOST" == "" || "$PORT" == "" ]]; then
    echoerr "Error: you need to provide a host and port to test."
    usage
fi

TIMEOUT=${TIMEOUT:-15}
STRICT=${STRICT:-0}
CHILD=${CHILD:-0}
QUIET=${QUIET:-0}

# check to see if timeout is from busybox?
# check to see if timeout is from busybox?
TIMEOUT_PATH=$(realpath $(which timeout))
if [[ $TIMEOUT_PATH =~ "busybox" ]]; then
        ISBUSY=1
        BUSYTIMEFLAG="-t"
else
        ISBUSY=0
        BUSYTIMEFLAG=""
fi

if [[ $CHILD -gt 0 ]]; then
    wait_for
    RESULT=$?
    exit $RESULT
else
    if [[ $TIMEOUT -gt 0 ]]; then
        wait_for_wrapper
        RESULT=$?
    else
        wait_for
        RESULT=$?
    fi
fi

if [[ $CLI != "" ]]; then
    if [[ $RESULT -ne 0 && $STRICT -eq 1 ]]; then
        echoerr "$cmdname: strict mode, refusing to execute subprocess"
        exit $RESULT
    fi
    exec $CLI
else
    exit $RESULT
fi
```

NOTE: this file if you want, you can review it to understand it in more detail, but in summary what it does is expect that a host and port is running something to then run a script that is sent to it by parameter

In the `deploy/docker/scripts/start_workshop.sh` file:

```bash
#!/bin/bash

set -e
set -x

if [ -e ./workshop.deployed ] || [ "$LOAD_INITIAL_DATA" = 'false' ]
then
  echo "Workshop is deployed"
else
  cd /usr/src/app/front
  webpack --config webpack.prod.config.js
  cd -

  python manage.py makemigrations links --noinput
  python manage.py migrate --noinput
  python manage.py collectstatic --noinput
  python manage.py loaddata data/users.json
  python manage.py loaddata data/links.json

  touch ./workshop.deployed
  export LOAD_INITIAL_DATA=false
fi
python manage.py runworker
```

In this script we are going to put the commands that we want to be run to start the container.

#### nginx configuration

Nginx is a reverse proxy that allows us to configure the entry points of our application and also in production it will directly serve the static files of the application.

To configure it we will use an image of **docker** that is named **tutum/nginx ** where with simply changing the `sites-enabled` we can have a nginx ready.

In the `deploy/docker/nginx/Dockerfile` file:

```dockerfile
FROM tutum/nginx
RUN rm /etc/nginx/sites-enabled/default
ADD sites-enabled/workshop /etc/nginx/sites-enabled/workshop
```

En el archivo `deploy/docker/nginx/sites-enabled/workshop`:

```conf
server {
    listen 80;
    client_max_body_size 100M;

    location /static {
        alias /usr/src/app/static;
    }

    location / {
            proxy_pass http://daphne:8000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";

            proxy_redirect     off;
            proxy_set_header   Host $host;
            proxy_set_header   X-Real-IP $remote_addr;
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Host $server_name;

        }
}
```

### Docker compose and environment variables

We have already defined our nginx and the scripts that we have to use, therefore we just need to have the `docker-compose.yml` with all the services we will use.

#### Environment Variables

In order to configure the application and the database we will use a `.env` file.
In general, a `.env` is not uploaded, but a `.exv.example` or `.env.dist` is left as an example to show what variables we have to configure.

In the `.env.dist` file we will put:

```env
COMPOSE_HTTP_TIMEOUT=500
SECRET_KEY='&er^y6-o09sxig_#pp7ezpt+i#mt!t^*(1z^^_-pa6j(twz_i5'
ALLOWED_HOSTS=["*"]
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_PASSWORD=secret
POSTGRES_USER=workshop
POSTGRES_DB=workshop
EXTERNAL_PORT=80
APP_DNS=localhost
LANGUAGE_CODE=en-US
TIME_ZONE=UTC
REDIS_HOST=redis
REDIS_PORT=6379
LOG_FILE=/var/log/workshop/workshop.log
HOST=localhost
LOAD_INITIAL_DATA=true
```

The names of the variables are quite intuitive, so we will not stop to explain each one.

NOTE: To not upload the file **.env** we will add `.env` to the end of the `.gitignore` file.

### Dockerfile update

In the `Dockerfile` file, we are going to add these lines before the line that says `EXPOSE 8000`:

```dockerfile
# Copy example data folder
COPY ./data /usr/src/app/data

# Copy production files and create production folders
COPY ./deploy/docker/scripts/start_workshop.sh /usr/src/app/start_workshop.sh
COPY ./deploy/docker/scripts/wait-for-it.sh /usr/src/app/wait-for-it.sh
RUN mkdir -p /var/log/workshop/
RUN touch /var/log/workshop/workshop.log
```

With this we are going to add the scripts we did, we are going to create the log files and we are going to have the sample data jsons that we had before.

### Docker compose

To finalize the files, we are going to add the `docker-compose.yml` that will join everything we put together before.

In the file `deploy/docker/docker-compose.yml` we will put:

```yaml
version: '3.4'

services:
  daphne:
    restart: always
    build: ../../.
    depends_on:
      - worker
      - redis
    env_file:
      - .env
    environment:
      - DJANGO_SETTINGS_MODULE=workshop.settings_prod
    command: bash -c 'daphne -b 0.0.0.0 -p 8000 workshop.asgi:channel_layer'

  worker:
    restart: always
    build: ../../.
    env_file:
      - .env
    volumes:
      - type: bind
        source: /srv/deploys/workshopdata/static
        target: /usr/src/app/static
    environment:
      - DJANGO_SETTINGS_MODULE=workshop.settings_prod
    command: ./wait-for-it.sh -p 5432 -h postgres -t 40 -- ./start_workshop.sh

  nginx:
    restart: always
    build: ./nginx/
    depends_on:
      - daphne
      - worker
    volumes:
      - type: bind
        source: /srv/deploys/workshopdata/static
        target: /usr/src/app/static
        read_only: true
    environment:
      - VIRTUAL_HOST=${HOST}

  postgres:
    restart: always
    image: postgres:9.6
    env_file:
      - ./.env
    volumes:
      - type: bind
        source: /srv/deploys/workshopdata/postgres
        target: /var/lib/postgresql/data

  nginx-proxy:
    restart: always
    image: jwilder/nginx-proxy
    depends_on:
      - nginx
    ports:
      - '${EXTERNAL_PORT}:80'
    volumes:
      - type: bind
        source: /var/run/docker.sock
        target: /tmp/docker.sock
        read_only: true

  redis:
    image: redis:4.0.2
    restart: always
```

Important file details:

- **EXTERNAL_PORT**: it is the port that we will use to access the application, this variable must be configured in the terminal that executes the `docker-compose` commands

- **HOST**: it is the domain that we are going to use to access the application, this variable must be configured in the terminal that executes the commands of `docker-compose`

## Deploy
At this point, we can already run the production server.

#### In a terminal we run

```bash

# En este caso usa localhost pero cuando lo tengas productivo podrias usar el dominio que tengas
export HOST=localhost
export EXTERNAL_PORT=80

docker-compsoe up --build -d
```

- **--build**: hace que las imagenes se generen de nuevo con el codigo actualizado

- **-d**: hace que corra en segundo plano

#### View logs and check containers status

```bash
# Ver los logs hasta el momento
docker-compose logs

# Ver los logs y seguir viendo los nuevos
docker-compose logs -f

# Ver estado de los containers
docker-compose ps
```

#### Stop application

```bash
docker-compose stop
```

#### Stop application and remove containers

NOTE: This command remove containers and network but does not remove database data

```bash
docker-compose down
```

## Final result:

You should see the links detail page with the links you have loaded in the browser at `http://localhost/links/`.
You can try to change something in the admin (in `http://localhost/admin/links/link/`) and it will automatically change in the frontend.