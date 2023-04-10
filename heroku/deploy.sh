export NODE_ENV=development
cd workshop/front
npm install -g yarn
yarn install
node_modules/.bin/webpack --config webpack.local.config.js
cd -
python workshop/manage.py migrate
python workshop/manage.py collectstatic --noinput
python workshop/manage.py loaddata data/users.json
python workshop/manage.py loaddata data/links.json
python workshop/manage.py runserver "0.0.0.0:$PORT"

