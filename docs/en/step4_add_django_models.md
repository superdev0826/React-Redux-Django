# Step 4: Add Django models

[Back to Step 3](/en/step3_add_non_react_views)

## Add models (Links and Tags)

We want to show that ReactJS can easily be used with an existing project, so
we will add a few models to simulate that this is an old existing
Django project.

### I added the following lines to **workshop/links/models.py**:

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

#### Notes
- If you have never seen `gettext` for translations, you could take some time
and learn about [translation](https://docs.djangoproject.com/en/1.11/topics/i18n/translation/) first.
- If you have never seen `ManyToManyField` with `through`, you could take some time
and learn about [extra fields on many to many relationships](https://docs.djangoproject.com/en/1.11/topics/db/models/#extra-fields-on-many-to-many-relationships) first.

## Add models to Django admin

### I added the following lines to **workshop/links/admin.py**:

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

### Create migrations for create new links models in db
Let's just generate migrations:
```bash
# with docker
docker exec -it workshop ./workshop/manage.py makemigrations

# without docker
./workshop/manage.py makemigrations
```

### Update db with new links models
Let's just update db:
```bash
# with docker
docker exec -it workshop ./workshop/manage.py migrate

# without docker
./workshop/manage.py migrate
```

### Import example files

Next, I added a few examples to the models.

```python
## Exported with
## docker exec -it workshop ./workshop/manage.py dumpdata --indent 2 -o links.json links
##   or
## ./workshop/manage.py dumpdata --indent 2 -o links.json links

# with docker
docker exec -it workshop ./workshop/manage.py loaddata data/links.json

# without docker
./workshop/manage.py loaddata data/links.json
```

## Add translations
If you have never seen Django translations, you could take some time
and learn about [translation](https://docs.djangoproject.com/en/1.11/topics/i18n/translation/) first.

### Add settings for translation in Django settings

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

### Create translation for new language (es)

```bash
# with docker
docker exec -it workshop bash -c "apt update; apt --force-yes install -y gettext"
mkdir workshop/locale
docker exec -it workshop ./workshop/manage.py makemessages --locale=es

# without docker
apt update
apt --force-yes install -y gettext
mkdir workshop/locale
./workshop/manage.py makemessages --locale=es
```
Complete the translations **workshop/locale/es/LC_MESSAGES/django.po**

### Compile translation for new language (es)

```
# with docker
docker exec -it workshop ./workshop/manage.py compilemessages

# without docker
./workshop/manage.py compilemessages
```

## Add new entries to gitignore
And finally we should update `.gitignore` file, add `*.mo`.

## Result
At this point, you can run project with admin and translations.

### Run project
```
# with docker
docker exec -it workshop ./workshop/manage.py runserver 0.0.0.0:8000

# without docker
./workshop/manage.py runserver
```

You should see the "Links" in your browser at `http://localhost:8000/admin/links/link/`.
You can change the URL to `http://localhost:8000/admin/links/tag/` and you should see
"Tags".

[Step 5: Add django webpack loader](/en/step5_add_django_webpack_loader)
