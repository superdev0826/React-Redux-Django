# Paso 1: Crear tu proyecto de Django

[Volver a la rama maestra](/es/master)

## Crear proyecto django
Como no tenemos un proyecto a mano, creamos uno nuevo:

```bash
docker run -d -it --name workshop -v $PWD:/src -p 8000:8000 --workdir /src python:3.6 bash
docker exec -it workshop bash

# dentro del container de docker
pip install Django
django-admin startproject workshop
```
Si nunca has visto `docker`, deberías tomarte un tiempo
y aprender primero sobre [docker](https://docs.docker.com).

Opción sin `docker` (con `mkvirtualenv`):
```bash
mkvirtualenv djreact
pip install Django
django-admin startproject workshop
```
Si nunca viste el comando `mkvirtualenv`, podrías tomarte un tiempo
y aprender sobre [virtualenvwrappler](http://virtualenvwrapper.readthedocs.org/en/latest/) primero.

Esto crea un nuevo proyecto de Django en la carpeta raíz de su repositorio.

## Agregar requirements
También vamos a crear un `requirements.txt`:
```bash
# con docker
docker exec -it workshop pip freeze > requirements.txt

# sin docker
pip freeze > requirements.txt
```
Si nunca usaste `requirements.txt`, te recomiendo ver la
[documentación de pip](https://pip.readthedocs.org/en/1.1/requirements.html).

## Agregar gitignore
Y finalmente deberíamos crear un archivo `.gitignore` y agregar `*.pyc` y
`db.sqlite3` para ignorarlos en el repositorio.

## Resultado
En este punto, podes ejecutar el proyecto.

### Ejecutar projecto
```
# con docker
docker exec -it workshop ./workshop/manage.py runserver 0.0.0.0:8000

# sin docker
./workshop/manage.py runserver
```

Debería ver la página de bienvenida de Django en el navegador en `http://localhost:8000`.

[Paso 2: Crear aplicación de Django](/es/step2_create_django_app)
