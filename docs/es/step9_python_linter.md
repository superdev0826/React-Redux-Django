# Paso 9: Python linter

[Volver al paso 8](/es/step8_hot_reloading)

**Pylint** es una herramienta que busca errores en el código Python, intenta aplicar un estándar
de codificación y busca code smells. También puede buscar ciertos errores de tipo,
puede recomendar sugerencias sobre cómo se pueden refactorizar determinados bloques
y puede ofrecerle detalles sobre la complejidad del código.

Otros proyectos similares son **pychecker**, **pyflakes**, **flake8** y **mypy**.
El estilo de codificación utilizado por Pylint está cerca de PEP8.

Pylint mostrará una cantidad de mensajes mientras analiza el código y también se
puede usar para mostrar algunas estadísticas sobre el número de advertencias y
errores encontrados en diferentes archivos.
Los mensajes se clasifican en varias categorías como errores y advertencias.

Por último, pero no por ello menos importante, al código se le asigna un puntaje general,
según el número y la gravedad de las advertencias y los errores.

## Instalar dependencias para pylint
Instalar **pylint** y **pylint-django**:
```bash
# con docker
docker exec -it workshop pip install pylint pylint-django

# sin docker
pip install pylint pylint-django
```

### Crear requirements-dev
Vamos a usar requirements-dev porque estas dependencias son solo de desarrollo.
```bash
# con docker
docker exec -it workshop pip freeze | grep pylint > requirements-dev.txt

# sin docker
pip freeze | grep pylint > requirements-dev.txt
```

## Crear .pylintrc
El archivo **.pylintrc** tiene todas las reglas para **pytlint**.

### Generar archivo rc base
```bash
# con docker
docker exec -it workshop pylint --generate-rcfile > .pylintrc

# sin docker
pylint --generate-rcfile > .pylintrc
```

### Personalizar nuestro archivo rc
```diff
 # Add files or directories to the blacklist. They should be base names, not
 # paths.
-ignore=CVS
+ignore=tests.py, urls.py, wsgi.py, migrations

 # Add files or directories matching the regex patterns to the blacklist. The
 # regex matches against base names, not paths.
-ignore-patterns=
+ignore-patterns=migrations
```

## Resultado
En esta punto, podes ejecutar **pylint**.

### Ejecutar pylint
```bash
# con docker
docker exec -it workshop pylint --output-format=colorized --load-plugins pylint_django workshop/workshop workshop/links

# sin docker
pylint --output-format=colorized --load-plugins pylint_django workshop/workshop workshop/links
```

### Leer el reporte de pylint
El comando **pylint** retorna:
```c++
************* Module links.models
C: 11, 0: Missing class docstring (missing-docstring)
C: 25, 0: Missing class docstring (missing-docstring)
C: 41, 0: Missing class docstring (missing-docstring)
************* Module links.admin
C: 11, 0: Missing class docstring (missing-docstring)
C: 15, 0: Missing class docstring (missing-docstring)
C: 20, 0: Missing class docstring (missing-docstring)
************* Module links.views
C:  1, 0: Missing module docstring (missing-docstring)
W:  1, 0: Unused render imported from django.shortcuts (unused-import)
************* Module links.apps
C:  1, 0: Missing module docstring (missing-docstring)
C:  4, 0: Missing class docstring (missing-docstring)

------------------------------------------------------------------
Your code has been rated at 8.51/10 (previous run: 6.74/10, +1.76)
```

El tipo de mensaje puede ser:
- **R**: Refactor, una infracción de "buena práctica"
- **C**: Convenio para la codificación de violación estándar (PEP8)
- **W**: Advertencia de problemas de diseño o problemas menores de programación
- **E**: Error para problemas importantes de programación (es decir, probablemente sea un error)
- **F**: Fatal para los errores que impidieron el procesamiento posterior

Y finalmente, podrías arreglar los pylints que el linter nos devuelve.
Si quieres, podrías ver cómo los soluciono en este commit:  [correcciones](https://gitlab.com/FedeG/django-react-workshop/commit/e462a19f96b8ad44e026df84ecddaa8639b1a5a6)

[Paso 10: React linter](/es/step10_react_linter)
