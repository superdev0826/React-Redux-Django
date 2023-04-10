# Taller de Django + React + Redux
Este repositorio va a ser usado en la PyconAr2017 para dar el paso a paso del taller
"Django + React + Redux".

## Estado
[![pipeline status](https://gitlab.com/FedeG/django-react-workshop/badges/master/pipeline.svg)](https://gitlab.com/FedeG/django-react-workshop/commits/master) [![coverage report](https://gitlab.com/FedeG/django-react-workshop/badges/master/coverage.svg)](https://gitlab.com/FedeG/django-react-workshop/commits/master)

### [Documentación (español)](https://fedeg.gitlab.io/django-react-workshop/#/es/)
### Heroku con la aplicación: [web](https://django-react-workshop.herokuapp.com)

## Modalidades del repositorio
Para poder ir aprendiendo el repositorio hace el paso a paso para generar una
proyecto productivo con estas tecnologías.
Cada paso esta en una rama aparte con los archivos correspondiente del proyecto
en ese paso determinado.
Las ramas (pasos):
- Paso 1: [Crear proyecto de Django](/es/step1_create_project)
- Paso 2: [Crear aplicación de Django](/es/step2_create_django_app)
- Paso 3: [Agregar una vista sin React](/es/step3_add_non_react_views)
- Paso 4: [Agregar modelo de Django](/es/step4_add_django_models)
- Paso 5: [Agregar django_webpack_loader](/es/step5_add_django_webpack_loader)
- Paso 6: [Crear la primer componente de React](/es/step6_create_first_react_component)
- Paso 7: [Usar el paquete con React](/es/step7_use_the_bundle)
- Paso 8: [Recarga automática](/es/step8_hot_reloading)
- Paso 9: [Python linter](/es/step9_python_linter)
- Paso 10: [React linter](/es/step10_react_linter)
- Paso 11: [Python testing](/es/step11_python_testing)
- Paso 12: [React testing](/es/step12_react_testing)
- Paso 13: [Enviar contexto de Django en React](/es/step13_django_context_in_react)
- Paso 14: [Api rest y fetch de datos](/es/step14_api_rest)
- Paso 15: [Django channels y websockets](/es/step15_websockets_and_channels)
- Paso 16: [Agregar Redux](/es/step16_add_redux)
- Paso 17: [Entorno de producción](/es/step17_going_to_production)

Cada rama tiene la documentación en español (`README-es.md`) y en ingles (`README.md`).

## Requirimientos del proyecto
Los requerimientos van variando a lo largo del proyecto, como este repositorio todavía
puede que alguno todavía no esten.
Mi recomendación para hacer el curso rápido es que te instales de antemano los mas posible.
En mi caso me gusta usar docker como se puede ver en cada paso pero también esta la
opción sin docker para la gente que no lo usa.

#### Imagen de docker con todo el workshop
Esta imagen tiene el codigo, pip requirements (dev, docs y production requirements), node dependencies (pruduction y dev dependencies), ...
```bash
docker pull registry.gitlab.com/fedeg/django-react-workshop:latest
```

### Instalación previa con Docker
```bash
# Clonar el repositorio
git clone https://gitlab.com/FedeG/django-react-workshop.git
cd django-react-workshop

# Python y Django
docker run -d -it --name workshop -v $PWD:/src -p 8000:8000 --workdir /src python:3.6 bash
docker exec -it workshop pip install -r requirements.txt
docker exec -it workshop pip install -r requirements-dev.txt

# Node y React
docker run -d -it --name workshopjs -v $PWD:/src -p 3000:3000 --workdir /src/workshop/front node:8 bash
docker exec -it workshopjs npm install yarn --global
docker exec -it workshopjs yarn install
```

### Instalación previa sin Docker
```bash
# Clonar el repositorio
git clone https://gitlab.com/FedeG/django-react-workshop.git
cd django-react-workshop

# Python y Django
## Instalar python 3 (3.5 o 3.6 idealmente)
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Node y React
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y build-essential nodejs
npm install yarn --global
cd workshop/front
yarn install
```
