# Django + React + Redux workshop
This repository will be used in the PyconAr2017 to take the step by step for "Django + React + Redux" workshop.

## Status
[![pipeline status](https://gitlab.com/FedeG/django-react-workshop/badges/master/pipeline.svg)](https://gitlab.com/FedeG/django-react-workshop/commits/master) [![coverage report](https://gitlab.com/FedeG/django-react-workshop/badges/master/coverage.svg)](https://gitlab.com/FedeG/django-react-workshop/commits/master)

### [Documentation (english)](https://fedeg.gitlab.io/django-react-workshop/#/en/)
### Heroku with app (auto deployment): [web](https://django-react-workshop.herokuapp.com)

## Repository details
This repository have the step by step for generate a productive project with these technologies.
Each step is a branch with the project files for that step.
The branches (steps):
- Step 1:  [create Django project](/en/step1_create_project)
- Step 2:  [create Django app](/en/step2_create_django_app)
- Step 3:  [add non-React views](/en/step3_add_non_react_views)
- Step 4:  [add Django models](/en/step4_add_django_models)
- Step 5:  [add django_webpack_loader](/en/step5_add_django_webpack_loader)
- Step 6:  [create first React component](/en/step6_create_first_react_component)
- Step 7:  [use the bundle](/en/step7_use_the_bundle)
- Step 8:  [hot reloading](/en/step8_hot_reloading)
- Step 9:  [Python linter](/en/step9_python_linter)
- Step 10: [React linter](/en/step10_react_linter)
- Step 11: [Python testing](/en/step11_python_testing)
- Step 12: [react testing](/en/step12_react_testing)
- Step 13: [Django context in React](/en/step13_django_context_in_react)
- Step 14: [api rest](/en/step14_api_rest)
- Step 15: [websockets and channels](/en/step15_websockets_and_channels)
- Step 16: [add redux](/en/step16_add_redux)
- Step 17: [going to production](/en/step17_going_to_production)

Each branch has the documentation in Spanish (`README-es.md`) and in English (` README.md`).

## Project requirements
My recommendation for the course is you install requirements before start.
I want use docker (as you can see in each step) but also exists option without docker.

#### Docker image (all-inclusive)
This image have code, pip requirements (dev, docs and production requirements), node dependencies (pruduction and dev dependencies), ... 
```bash
docker pull registry.gitlab.com/fedeg/django-react-workshop:latest
```

### Install with docker
```bash
# Clone
git clone https://gitlab.com/FedeG/django-react-workshop.git
cd django-react-workshop

# Python and Django
docker run -d -it --name workshop -v $PWD:/src -p 8000:8000 --workdir /src python:3.6 bash
docker exec -it workshop pip install -r requirements.txt
docker exec -it workshop pip install -r requirements-dev.txt

# Node and React
docker run -d -it --name workshopjs -v $PWD:/src -p 3000:3000 --workdir /src/workshop/front node:8 bash
docker exec -it workshopjs npm install yarn --global
docker exec -it workshopjs yarn install
```

### Install without docker
```bash
# Clone
git clone https://gitlab.com/FedeG/django-react-workshop.git
cd django-react-workshop

# Python and Django
## Install python 3 (3.5 or 3.6)
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Node and React
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y build-essential nodejs
npm install yarn --global
cd workshop/front
yarn install
```
