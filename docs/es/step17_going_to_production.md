# Paso 17: Producción

[Volver al paso 16](/es/step16_add_redux)

Este paso es importante a la hora de poner en producción tu aplicación.
Para enterder este paso primero tenemos que tener en mente como funciona este proyecto con Django y React.

Para producción solo vamos a tener a Django trabajando, ya que el js generado con React se va a usar como archivos estaticos.

## Configuración de produccion de Django

#### Nuevas dependencias

Vamos a agregar dos dependencias nuevas:

En el `requirements.txt` vamos a agregar:

```conf
asgi-redis==1.4.3
psycopg2-binary==2.7.6.1
```

- **asgi-redis**: para poder usar `redis` para encolar tareas

- **psycopg2-binary**: para poder usar `postgres` como base de datos

#### Crear un nuevo settings para produción

Para esto vamos a crear un archivo de settings nuevo: `settings_prod.py` en la carpeta `workshop/workshop` (la misma que el `settings.py` que usamos en desarrollo)

En ese archivos vamos a poner las configuraciones de producción a partir de las configuraciones que ya tenemos, es decir importando el `settings.py`:

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

##### Cosas importantes a destacar de este archivo:

- **DEBUG** y **DEBUG_TEMPLATES**: van a estar en false ya que en producción no se hace debug del codigo
- **os.getenv**: usaremos variables de entorno para poder configurar medienta un archivo `.env` o variables de nuestra consola
- **ALLOWED_HOSTS**: especificamos desde que dominio se puede acceder a esta aplicación
- **WEBPACK_LOADER**: usamos el stats de producción de webpack
- **DATABASES**: usamos una base de datos (en este caso postgres)
- **REST_FRAMEWORK**: la api solo va a ser accesible en modo lectura para usuario no logeados y va a responder JSON de forma predeterminada
- **CHANNEL_LAYERS**: para `django-channels` vamos a usar un `redis`
- **LOGGING**; usaremos una configuracion de logs acorde a producción

#### ¿Como usar ese settings?

Para usar el `settings_prod.py` que armamos, primero tenemos que armar un archivo `asgi.py` ya que vamos a estar usando `redis` para poder disparar acciones y encolar tareas.

En el archivo `workshop/workshop/asgi.py` vamos a poner:

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

En este caso vamos a dejar como valor predeterminado de `DJANGO_SETTINGS_MODULE` el `settings.py` original ya que podria usarse y cuando pensemos usar la aplicación en modo producción solamente tenemos que configurar esa variable de entorno con el valor `workshop.settings_prod`.

## Generar los archivos js de React para usar en el servidor productivo

Si vemos los archivos que tenemos en la carpeta `workshop/front` podemos ver uno que es `webpack.prod.config.js`.
Este archivo esta armado para generar los bundles finales de js que se van a utilizar en producción.

Para crear estos bundles vamos a hacer:

```javascript
cd workshop/front
webpack --config webpack.prod.config.js
```

Este comando igual lo hace el `Dockerfile` que ya tenemos, por ende no es necesario correrlo a mano a menos de que no uses **docker**.

## Servidor completo

Para empezar hay que comprender que si bien este taller da una forma, hay muchas formas distintas de hacerlo.
En este caso vamos a usar `docker-compose` que nos permite controlar varios servicios y enlazarlos entre si.


#### Infraestructura

Antes de detallar el codigo y archivos, vamos a hablar sobre la infraestrutura que vamos a usar:

- 2 containers con python, uno va a escuchar las peticiones de la web y otro va a realizar las tareas (para esto vamos a usar una herramienta llamada `daphne`).

- 2 containers con nginx, podria simplemente usarse uno pero para hacer mas facil la implementación del dominio y puertos, vamos a usar uno con un nginx configurado por nosotros y otro con `nginx-proxy` que es una herramienta que nos permite trabajar facilmente con el tema dominios y puertos.

- 1 container con postgres, esta es la base de datos que vamos a utilizar

- 1 container con redis

También para garantizar que los datos esten guardados vamos a usar volumenes, lo cuales son:

- **/srv/deploys/workshopdata/static**: para los archivos estaticos de nuestra aplicación

- **/srv/deploys/workshopdata/postgres**: para los archivos de la base de datos

#### Archivos base:

Vamos a crear archivos para el deploy dentro de la carpeta `deploy/docker`.

En esta carpeta vamos a crear dos carpetas: `nginx` y `scripts`

#### Scripts

Esta carpeta va a tener los scripts que vamos a utilizar en nuestro `docker-compose`.

Uno va a ser el script de arranque de la aplicación y otro va a ser un script que sirve para esperar que la base de datos este andando antes de correr el otro script.

En el archivo `deploy/docker/scripts/wait-for-it.sh`:

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

NOTA: este archivo si quieren pueden revisarlo para entenderlo en mas detalle, pero en resumen lo que hace es esperar que en un host y puerto este corriendo algo para despues ejecutar un script que se le envia por parametro

En el archivo `deploy/docker/scripts/start_workshop.sh`:

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

En este script vamos a poner los comandos que queremos que se corrar para iniciar el container.

#### Configuración del nginx

Nginx es un proxy reverso que nos permite configurar los puntos de entrada de nuestra aplicacíón y ademas en produción va a servir directamente los archivos estaticos de la aplicación.

Para configurarlo vamos a usar una imagen de **docker** que se llama **tutum/nginx** en donde con simplemente cambiar el `sites-enabled` podemos tener un nginx listo.

En el archivo `deploy/docker/nginx/Dockerfile`:

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

### Docker compose y variables de entorno

Ya tenemos definido nuestro nginx y los scripts que tenemos que usar, por ende solo nos falta tener el `docker-compose.yml` con todos los servicion que utilizaremos.

#### Variables de entorno

Para poder configurar la aplicación y la base de datos vamos a usar un archivo `.env`.
Por lo general no se sube un `.env` sino que se deja un `.env.example` o `.env.dist` como ejemplo para mostrar que variables tenemos para configurar.

En el archivo `.env.dist` vamos a poner:

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

Los nombres de las variables son bastante intuitivos por lo que no nos vamos a detener en explicar cada uno.

NOTA: Para no subir el archivo **.env** vamos a agregar `.env` al final del archivo `.gitignore`.

### Actualizacion del Dockerfile

En el archivo `Dockerfile`, vamos a agregar estas lineas antes del la linea que dice `EXPOSE 8000`:

```dockerfile
# Copy example data folder
COPY ./data /usr/src/app/data

# Copy production files and create production folders
COPY ./deploy/docker/scripts/start_workshop.sh /usr/src/app/start_workshop.sh
COPY ./deploy/docker/scripts/wait-for-it.sh /usr/src/app/wait-for-it.sh
RUN mkdir -p /var/log/workshop/
RUN touch /var/log/workshop/workshop.log
```

Con esto vamos a agregarlo los scripts que hicimos, vamos a crear los archivos de log y vamos a tener los json de data de ejemplo que teniamos de antes.

### Docker compose

Para finalizar los archivos, vamos a agregar el `docker-compose.yml` que va a unir todo lo que armamos anteriormente.

En el archivo `deploy/docker/docker-compose.yml` vamos a poner:

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

Detalles importantes del archivo:

- **EXTERNAL_PORT**: es el puerto que vamos a usar para acceder a la aplicación, esta variable la tenemos que tener configurada en la terminal que ejecute los comandos de `docker-compose`

- **HOST**: es el dominio que vamos a usar para acceder a la aplicación, esta variable la tenemos que tener configurada en la terminal que ejecute los comandos de `docker-compose`

## Puesta en marcha del servidor
En este punto, ya podemos ejecutar el servidor productivo.

#### En una terminal corremos

```bash

# En este caso usa localhost pero cuando lo tengas productivo podrias usar el dominio que tengas
export HOST=localhost
export EXTERNAL_PORT=80

docker-compsoe up --build -d
```

- **--build**: hace que las imagenes se generen de nuevo con el codigo actualizado

- **-d**: hace que corra en segundo plano

#### Ver logs de la aplicación y si todo esta andando

```bash
# Ver los logs hasta el momento
docker-compose logs

# Ver los logs y seguir viendo los nuevos
docker-compose logs -f

# Ver estado de los containers
docker-compose ps
```

#### Parar la aplicación

```bash
docker-compose stop
```

#### Parar la aplicación y borrar los containers

NOTA: Esto borra los containers y la red interna pero no los datos de la base

```bash
docker-compose down
```

## Resultado final:

Deberías ver la página de links detail con los links que tengas cargados en el navegador en `http://localhost/links/`.
Podes probar de cambiar algo en el admin (en `http://localhost/admin/links/link/`) y automaticamente se va a cambiar en el frontend.