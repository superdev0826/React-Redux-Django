FROM python:3.5

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install nodejs and gettext
ENV NODE_VERSION 8.x
RUN curl -sL https://deb.nodesource.com/setup_${NODE_VERSION} | bash -
RUN apt-get install -y nodejs gettext build-essential npm \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install python requirements
COPY ./requirements.txt /usr/src/app/
COPY ./requirements-dev.txt /usr/src/app/
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir -r requirements-dev.txt

# Install node modules
COPY ./workshop/front/package.json /usr/src/app/front/
COPY ./workshop/front/yarn.lock /usr/src/app/front/
WORKDIR /usr/src/app/front
RUN npm install -g yarn webpack@1.12.13
RUN yarn install
WORKDIR /usr/src/app

# Copy test script file
COPY ./test.sh /usr/src/app/test.sh

# Copy python code and collectstatics
COPY ./workshop /usr/src/app
RUN mkdir -p /usr/src/app/links/static /usr/src/app/front/workshop/static
RUN python manage.py collectstatic --noinput

# Compile reactjs code
RUN cd /usr/src/app/front && webpack --config webpack.prod.config.js

# Compile .po files
RUN python manage.py compilemessages

# Copy example data folder
COPY ./data /usr/src/app/data

# Copy production files and create production folders
COPY ./deploy/docker/scripts/start_workshop.sh /usr/src/app/start_workshop.sh
COPY ./deploy/docker/scripts/wait-for-it.sh /usr/src/app/wait-for-it.sh
RUN mkdir -p /var/log/workshop/
RUN touch /var/log/workshop/workshop.log

EXPOSE 8000

VOLUME /usr/src/app

CMD ["tail", "-f", "/dev/null"]
