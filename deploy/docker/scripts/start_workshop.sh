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