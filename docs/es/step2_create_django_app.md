# Paso 2: Creamos nuestra aplicación de Django

[Volver al paso 1](/es/step1_create_project)

## Crear la aplicación django
Vamos a crear una nueva aplicación:

```bash
# con docker
docker exec -it workshop bash -c "cd workshop && ./manage.py startapp links"

# sin docker
cd workshop
./manage.py startapp links
```
Esto crea una nueva aplicación Django en la carpeta del proyecto de Django (__./workshop/links__).

## Agregar nueva aplicación a INSTALLED_APPS:
Agregue el nombre de la aplicación (`links`) a **INSTALLED_APPS** en __./workshop/workshop/settings.py__.

## Añadir django admin

### Crear base de datos con estado inicial (migrar modelos de autenticación de django)
Vamos a migrar la base de datos:
```bash
# con docker
docker exec -it workshop ./workshop/manage.py migrate

# sin docker
./workshop/manage.py migrate
```

### Agregar usuario administrador
Vamos a crear un súper usuario:
```bash
# con docker
docker exec -it workshop ./workshop/manage.py createsuperuser

# sin docker
./workshop/manage.py createsuperuser
```

## Resultado
En este punto, puedes ejecutar un proyecto con el administrador de Django.

### Ejecutar proyecto
```
# con docker
docker exec -it workshop ./workshop/manage.py runserver 0.0.0.0:8000

# sin docker
./workshop/manage.py runserver
```

Deberías ver la página de administración de Django en su navegador en `http://localhost:8000/admin/`.

[Paso 3: Agregar vistas que no son de React](/es/step3_add_non_react_views)

