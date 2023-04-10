# Paso 7: Usar el paquete

[Volver al paso 6](/es/step6_create_first_react_component)

En el último paso, hemos creado nuestro primer paquete, pero no hemos visto el resultado
en el navegador.
Ahora actualicemos nuestra plantilla para usar nuestra nueva y elegante aplicación ReactJS.

## Actualizar la template view1
Cambiamos `workshop/links/templates/view1.html` para que se vea así:
```html
{% extends "base.html" %}
{% load render_bundle from webpack_loader %}

{% block main %}
  <div id="app"></div>

  {% render_bundle 'vendors' %}
  {% render_bundle 'App' %}
{% endblock %}
```

## Actualizar la configuración de Django

### Agregar la configuración de WEBPACK_LOADER
En `workshop/workshop/settings.py`:
```python
WEBPACK_LOADER = {
    'DEFAULT': {
        'BUNDLE_DIR_NAME': 'bundles/local/',  # end with slash
        'STATS_FILE': os.path.join(BASE_DIR, 'front/webpack-stats-local.json'),
    }
}
```

#### Notas:
- `BUNDLE_DIR_NAME` le dice a Django en qué carpeta dentro de la carpeta `static`
puede encontrar nuestro paquete.
- `STATS_FILE` le dice a Django dónde puede encontrar el archivo JSON que mapea los
nombres de la componentes con los paquetes. Es por este archivo que podemos usar
`{% render_bundle 'App'%}` en nuestra template.

### Añadir STATIC_ROOT y actualizar STATICFILES_DIRS
```diff
STATIC_URL = '/static/'
+STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'links/static'),
+   os.path.join(BASE_DIR, 'front/workshop/static'),
]
```

## Cambiar el publicpath de webpack
Cambiar el publicpath en **workshop/front/webpack.local.config.js**:
```diff
// override django's STATIC_URL for webpack bundles
-config.output.publicPath = `http://${ip}:${port}/assets/bundles/`
+config.output.publicPath = `/static/bundles/local/`
```

## Compilar los paquetes
```bash
# con docker
docker exec -it workshopjs node_modules/.bin/webpack --config webpack.local.config.js

# sin docker
cd workshop/front
node_modules/.bin/webpack --config webpack.local.config.js
```

## Obtener archivos estáticos en Django
```bash
mkdir workshop/links/static

# con docker
docker exec -it workshop ./workshop/manage.py collectstatic

# sin docker
./workshop/manage.py collectstatic
```

## Resultado
En este punto, puedes correr el proyecto.

### Correr el proyecto
```
# con docker
docker exec -it workshop ./workshop/manage.py runserver 0.0.0.0:8000

# sin docker
./workshop/manage.py runserver
```

Deberías ver la página de App en tu navegador en `http://localhost:8000/`.

Ahora intenta hacer un cambio en tu aplicación ReactJS. Cambia `Sample App!` por
`Something New!` en `workshop/front/src/components/App/index.jsx`.

A continuación, ejecutamos build y collectstatic nuevamente, asegurando de que
runserver aún se esté ejecutando y visitaremos el sitio
en el navegador. Debería decir "Something New!" ahora.

Increíble, ¿verdad?
Añadiremos  para este caso en el siguiente paso.

[Paso 8: Recarga automatica](/es/step8_hot_reloading)
