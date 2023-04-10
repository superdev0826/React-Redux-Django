# Paso 4: agregar modelos de Django

[Volver al paso 3](/es/step3_add_non_react_views)

## Agregar modelos (Link y Tags)

Queremos mostrar que ReactJS se puede usar fácilmente con un proyecto existente, por lo que
agregaremos algunos modelos para simular que este es un projecto existente
de Django.

### Agregué las siguientes líneas a **workshop/links/models.py**:

```python
from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import ugettext as _


class Tag(models.Model):
    name = models.CharField(_('name'), max_length=30)
    description = models.TextField(_('description'), blank=True, null=True)
    user = models.ForeignKey(
        User, verbose_name=_('user'), blank=True, null=True,
        on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('tag')
        verbose_name_plural = _('tags')


class Link(models.Model):
    name = models.CharField(_('name'), max_length=30)
    url = models.URLField(_('url'))
    pending = models.BooleanField(_('pending'), default=False)
    description = models.TextField(_('description'), blank=True, null=True)
    tags = models.ManyToManyField(Tag, through='LinkTag', editable=True)
    user = models.ForeignKey(User, verbose_name=_('user'),
                             on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('link')
        verbose_name_plural = _('links')


class LinkTag(models.Model):
    link = models.ForeignKey(Link, verbose_name=_('link'),
                             on_delete=models.CASCADE)

    tag = models.ForeignKey(Tag, verbose_name=_('tag'),
                             on_delete=models.CASCADE)


    class Meta:
        unique_together = (('link', 'tag'))
        verbose_name = _('link x tag')
        verbose_name_plural = _('link x tag')
```

#### Notas
- Si nunca viste `gettext` para las traducciones, te recomiendo que aprendas primero sobre [traducción](https://docs.djangoproject.com/en/1.11/topics/i18n/translation/).
- Si nunca viste `ManyToManyField` con` through`, podrías tomarte un tiempo
y aprender sobre [campos adicionales en relaciones muchos a muchos] (https://docs.djangoproject.com/en/1.11/topics/db/models/#extra-fields-on-many-to-many-relationships) primero.

## Agregar modelos al admin de Django

### Agregué las siguientes líneas a **workshop/links/admin.py**:

```python
from django.contrib import admin
from .models import Link, Tag, LinkTag


class LinkTagInline(admin.TabularInline):
    model = LinkTag


@admin.register(Link)
class LinkAdmin(admin.ModelAdmin):
    inlines = [LinkTagInline]


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    pass
```

### Crear migraciones para crear nuevos modelos en la db
Generemos migraciones:
```bash
# con docker
docker exec -it workshop ./workshop/manage.py makemigrations

# sin docker
./workshop/manage.py makemigrations
```

### Actualizar db con nuevos modelos
Actualicemos la db:
```bash
# con docker
docker exec -it workshop ./workshop/manage.py migrate

# sin docker
./workshop/manage.py migrate
```

### Importar datos de ejemplo

A continuación, vamos a agregar algunos ejemplos a los modelos.

```python
## Exportado con
## docker exec -it workshop ./workshop/manage.py dumpdata --indent 2 -o links.json links
##   o
## ./workshop/manage.py dumpdata --indent 2 -o links.json links

# con docker
docker exec -it workshop ./workshop/manage.py loaddata data/links.json

# sin docker
./workshop/manage.py loaddata data/links.json
```

## Añadir traducciones
Si nunca vista traducciones de Django, podría tomarse un tiempo
y aprender primero sobre [traducciones](https://docs.djangoproject.com/en/1.11/topics/i18n/translation/).

### Agregar configuraciones para la traducción en la configuración de Django

```diff
...
 import os
+from django.utils.translation import ugettext_lazy as _
...

...
MIDDLEWARE = [
     ...
     'django.contrib.sessions.middleware.SessionMiddleware',
+    'django.middleware.locale.LocaleMiddleware',
     'django.middleware.common.CommonMiddleware',
     ...
]

...

     TEMPLATES = [
         {
             'BACKEND': 'django.template.backends.django.DjangoTemplates',
             'DIRS': [os.path.join(BASE_DIR, 'links/templates')],
             'APP_DIRS': True,
             'OPTIONS': {
                 'context_processors': [
                     'django.template.context_processors.debug',
                     'django.template.context_processors.request',
                     'django.contrib.auth.context_processors.auth',
                     'django.contrib.messages.context_processors.messages',
+                     'django.template.context_processors.i18n',
                 ],
             },
         },
     ]

...

+LOCALE_PATHS = (
+    os.path.join(BASE_DIR, 'locale'),
+)
+LANGUAGES = [
+    ('es', _('Spanish')),
+    ('en', _('English')),
+]
```

### Crear traducción para nuevos idiomas (es)

```bash
# con docker
docker exec -it workshop bash -c "apt update; apt --force-yes install -y gettext"
mkdir workshop/locale
docker exec -it workshop ./workshop/manage.py makemessages --locale=es

# sin docker
apt update
apt --force-yes install -y gettext
mkdir workshop/locale
./workshop/manage.py makemessages --locale=es
```
Completar las traducciones del archivo: **workshop/locale/es/LC_MESSAGES/django.po**

### Compilar la traducción para el nuevo idioma (es)

```
# con docker
docker exec -it workshop ./workshop/manage.py compilemessages

# sin docker
./workshop/manage.py compilemessages
```

## Añadir nuevas entradas al gitignore
Y finalmente debemos actualizar el archivo `.gitignore`, agregar `*.mo`.

## Resultado
En este punto, pudes ejecutar el proyecto con el admin y traducciones.

### Ejecutar proyecto
```
# con docker
docker exec -it workshop ./workshop/manage.py runserver 0.0.0.0:8000

# sin docker
./workshop/manage.py runserver
```

Deberías ver los "Links" en tu navegador en `http://localhost:8000/admin/links/link/`.
Podes cambiar la url a `http://localhost:8000/admin/links/tag/` y deberías ver los "Tags".

[Paso 5: Agregar Django webpack loader](/es/step5_add_django_webpack_loader)
