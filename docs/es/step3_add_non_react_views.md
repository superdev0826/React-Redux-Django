# Paso 3: Agregar vistas sin react

[Volver al paso 2](/es/step2_create_django_app)

## Agregar urls

Queremos mostrar que ReactJS se puede usar fácilmente con un proyecto existente, por lo que
agregaremos algunas "vistas heredadas" para simular que esta es una proyecto existente de Django.

### Agregué las siguientes líneas a **workshop/urls.py**:

```python
from django.conf.urls import include, url
from django.contrib import admin

urlpatterns = [
    path('admin/', admin.site.urls),
    path('links/', include('links.urls')),
]
```

### Agregué las siguientes líneas a **links/urls.py**:

```python
from django.urls import path
from django.views import generic

urlpatterns = [
    path('view2/',
        generic.TemplateView.as_view(template_name='view2.html')),
    path('',
        generic.TemplateView.as_view(template_name='view1.html')),
]
```

## Añadir carpeta de templates a la configuración de Django

A continuación, agregué algunas templates a la carpeta `templates` y finalmente me aseguré
que Django conozca estas templates al poner esto en `settings.py`:

```python
TEMPLATES = [
    {
        ...
        'DIRS': [os.path.join(BASE_DIR, 'links/templates')],
        ...
    },
]
```

### Agregar templates

La template base es el archivo **links/templates/base.html**. Este importa
[Twitter Bootstrap CSS Framework](http://getbootstrap.com):

```html
<!doctype html>
<html class="no-js" lang="">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
  </head>
  <body>
    {% block main %}{% endblock %}
  </body>
</html>
```

Las templates para las vistas son **links/templates/view1.html**:

```html
{% extends "base.html" %}

{% block main %}
<div class="container">
  <h1>View 1</h1>
</div>
{% endblock %}
```

y **links/templates/view2.html**:

```html
{% extends "base.html" %}

{% block main %}
<div class="container">
  <h1>View 2</h1>
</div>
{% endblock %}
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

Debería ver la página de "View 1" en su navegador en `http://localhost:8000/links/`.
Puedes cambiar la url a `http://localhost:8000/links/view2/` y debería ver la página de "View 2".

Estoy importando Twitter Bootstrap aquí porque también quiero mostrar que ReactJS
no se interpondrá en tu camino incluso si ya estás usando un CSS complejo
Más sobre esto en futuros pasos.


[Paso 4: Agregar modeles de Django](/es/step4_add_django_models)
