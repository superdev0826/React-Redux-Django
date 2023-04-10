# Paso 11: Python testing

[Volver al paso 10](/es/step10_react_linter)

## Tests framework: [Pytest](https://docs.pytest.org/en/latest/)
El framework **pytest** hace que sea más fácil escribir pequeñas pruebas, pero puede escalar para soportar pruebas funcionales complejas para aplicaciones y bibliotecas.

## Instalar dependencias para pytest
Instalamos **pytest**, **pytest-django**, **pytest-cov** (para reporte de cobertura) y **django_dynamic_fixture** (para testing con los modelos de Django e intereacción con la db):
```bash
pip install pytest pytest-django pytest-cov django_dynamic_fixture
```

### Actualizar requirements-dev
Usamos requirements-dev porque estas dependencias son dependencias de desarrollo.
```bash
# con docker
docker exec -it workshop pip freeze | grep pytest >> requirements-dev.txt
docker exec -it workshop pip freeze | grep django-dynamic-fixture >> requirements-dev.txt

# sin docker
pip freeze | grep pytest >> requirements-dev.txt
pip freeze | grep django-dynamic-fixture >> requirements-dev.txt
```

## Crear .coveragerc
El archivo **.coveragerc** tiene la configuración para **pytest-cov**.
Necesitamos agregar lo siguiente en nuestro **workshop/.coveragerc**:
```bash
[run]
source =
    links/
    workshop/
omit =
    links/migrations/*
    links/test_*
    links/tests/*
    workshop/migrations/*
    workshop/test_*
    workshop/tests/*
```

## Crear tests
Vamos a crear una nueva funcionalidad y crear tests para esa funcionalidad.

### Crear nueva funcionalidad
Vamos a crear funciones para buscar Tags similares.
Necesitamos agregar lo siguiente en nuestro **workshop/links/constant.py**:
```python
"""
    Constants for link application
"""
SIMILAR_RATIO = 0.5
```

En **workshop/links/utils.py**:
```python
"""
    Utils module for link application
"""
import difflib
from .constant import SIMILAR_RATIO


def is_similar(source, target):
    """
        Return if source string is similar to target string
    """
    seq = difflib.SequenceMatcher(a=source, b=target)
    ratio = seq.ratio()
    return ratio >= SIMILAR_RATIO
```

En **workshop/links/utils.py**:
```python
"""
    Utils module for link application
"""
import difflib
from .constant import SIMILAR_RATIO


def is_similar(source, target):
    """
        Return if source string is similar to target string
    """
    seq = difflib.SequenceMatcher(a=source, b=target)
    ratio = seq.ratio()
    return ratio >= SIMILAR_RATIO
```

En **workshop/links/models.py**:
```diff
from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import ugettext as _
+from links.utils import is_similar


class Tag(models.Model):
@@ -19,6 +20,14 @@ class Tag(models.Model):
    def __str__(self):
        return self.name

+    def get_similars(self):
+        """
+            Return similars links (search for name)
+        """
+        tags = Tag.objects.all().exclude(pk=self.pk)
+        similars = [tag for tag in tags if is_similar(self.name, tag.name)]
+        return similars
+
```

### Crear tests:

### Notas:
Estos conceptos son importantes para este paso:
- [pytest.mark](https://docs.pytest.org/en/latest/mark.html)
- [pytest.mark.django_db](http://pytest-django.readthedocs.io/en/latest/helpers.html#pytest-mark-django-db-transaction-false-request-database-access)
- [django_dynamic_fixture](http://django-dynamic-fixture.readthedocs.io/en/latest/overview.html#basic-example-of-usage)

### Crear carpeta de tests:
Vamos a crear la carpeta **workshop/links/tests/** y el archivo **workshop/links/tests/__init__.py**.

### Crear tests para utils
En **workshop/links/tests/test_utils.py**:
```python
"""
    Tests for utils module
"""
from unittest.mock import patch
import pytest

from links.utils import is_similar


def test_is_similar_should_return_true_when_strings_are_similars():
    assert is_similar('python', 'pytohn')


def test_is_similar_should_return_false_when_strings_not_are_similars():
    assert not is_similar('python', 'javascript')


@pytest.mark.unit_tests
@patch('difflib.SequenceMatcher')
def test_is_similar_should_call_SequenceMatcher(sequence_matcher_mock):
    sequence_matcher_mock().ratio.return_value = 4
    is_similar('python', 'pytohn')
    sequence_matcher_mock.assert_called()
    sequence_matcher_mock.assert_called_with(a='python', b='pytohn')
```

### Crear tests para el modelo Tag
En **workshop/links/tests/test_tag.py**:
```python
"""
    Tests for Tag model
"""
from unittest.mock import patch
from django_dynamic_fixture import G

import pytest

from links.models import Tag


@pytest.mark.django_db
def test_get_similars_should_omit_self():
    tag_python = G(Tag, name='python')
    assert tag_python.get_similars() == []


@pytest.mark.django_db
def test_get_similars_should_return_similars():
    tag_python = G(Tag, name='python')
    tag_pytohn = G(Tag, name='pytohn')
    tag_pyton = G(Tag, name='pyton')
    tag_ypthon = G(Tag, name='ypthon')
    assert tag_python.get_similars() == [tag_pytohn, tag_pyton, tag_ypthon]


@pytest.mark.django_db
def test_get_similars_should_not_return_strings_with_differences():
    tag_python = G(Tag, name='python')
    G(Tag, name='react')
    G(Tag, name='javascript')
    assert tag_python.get_similars() == []


@pytest.mark.django_db
@pytest.mark.unit_tests
@patch('links.models.is_similar')
def test_get_similars_should_call_is_similar(similar_mock):
    tag = G(Tag, name='python')
    G(Tag, name='python2')
    tag.get_similars()
    similar_mock.assert_called()


@pytest.mark.django_db
@pytest.mark.unit_tests
@patch('links.models.is_similar')
def test_get_similars_should_call_is_similar_will_all_other_tags(similar_mock):
    tag_python = G(Tag, name='python')
    tag_python2 = G(Tag, name='python2')
    tag_python3 = G(Tag, name='python3')
    tag_python.get_similars()
    similar_mock.assert_called()
    assert similar_mock.call_count == 2
    similar_mock.assert_any_call(tag_python.name, tag_python2.name)
    similar_mock.assert_any_call(tag_python.name, tag_python3.name)
```

## Crear configuración de pytests y de django-dynamic-fixture
Vamos a crear el archivo **workshop/setup.cfg** con este contenido:
```
[tool:pytest]
addopts = --ds=workshop.settings
```

## Actualizar reglas de pylintrc
Vamos a agregar la carpeta de tests a la regla de ignore de pylint:
```diff
-ignore=tests.py, urls.py, wsgi.py, migrations
+ignore=tests.py, urls.py, wsgi.py, migrations, tests
```

## Actualizar gitignore
Y finalmente tenemos que actualizar el archivo `.gitignore` y agregarle `.coverage`, `.cache` y `htmlcov/`.

## Resultado
En este punto, podemos ejecutar **pytest** y leer los reportes.

### Ejecutar pytest
```bash
# con docker
docker exec -it workshop bash -c 'cd workshop; py.test --cov-report term-missing --cov-report html --cov'

# sin docker
cd workshop
py.test --cov-report term-missing --cov-report html --cov
```

### Leer reporte de pytest
El comando **pytest** retorna:
```c++
============================= test session starts ==============================
platform linux -- Python 3.6.3, pytest-3.2.3, py-1.4.34, pluggy-0.4.0
Django settings: workshop.settings (from command line option)
rootdir: /src/workshop, inifile: setup.cfg
plugins: django-3.1.2, cov-2.5.1
collected 8 items

links/tests/test_tag.py .....
links/tests/test_utils.py ...

----------- coverage: platform linux, python 3.6.3-final-0 -----------
Name                   Stmts   Miss  Cover   Missing
----------------------------------------------------
links/__init__.py          0      0   100%
links/admin.py            10      0   100%
links/apps.py              3      3     0%   5-12
links/constant.py          1      0   100%
links/models.py           36      2    94%   21, 48
links/tests.py             1      1     0%   1
links/urls.py              3      3     0%   1-4
links/utils.py             6      0   100%
links/views.py             0      0   100%
workshop/__init__.py       0      0   100%
workshop/settings.py      24      0   100%
workshop/urls.py           3      3     0%   16-19
workshop/wsgi.py           4      4     0%   10-16
----------------------------------------------------
TOTAL                     91     16    82%
Coverage HTML written to dir htmlcov


=========================== 8 passed in 2.88 seconds ===========================
```

### Leer reporte html de pytest
Vamos a abrir `workshop/htmlcov/index.html` en el navegador para ver el reporte html.

[Paso 12: React testing](/es/step12_react_testing)
