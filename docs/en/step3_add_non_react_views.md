# Step 3: Add non-reactJS views

[Back to Step 2](/en/step2_create_django_app)

## Add urls

We want to show that ReactJS can easily be used with an existing project, so
we will add a few "legacy-views" to simulate that this is an old existing
Django project.

### I added the following lines to **workshop/urls.py**:

```python
from django.conf.urls import include, url
from django.contrib import admin

urlpatterns = [
    path('admin/', admin.site.urls),
    path('links/', include('links.urls')),
]
```

### I added the following lines to **links/urls.py**:

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

## Add template folder to Django settings

Next, I added a few templates to the `templates` folder and finally I made sure
that Django is aware of these templates by putting this into `settings.py`:

```python
TEMPLATES = [
    {
        ...
        'DIRS': [os.path.join(BASE_DIR, 'links/templates')],
        ...
    },
]
```

### Add templates

The base-template is the file **links/templates/base.html**. It imports the
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

The templates for the two views are **links/templates/view1.html**:

```html
{% extends "base.html" %}

{% block main %}
<div class="container">
  <h1>View 1</h1>
</div>
{% endblock %}
```

and **links/templates/view2.html**:

```html
{% extends "base.html" %}

{% block main %}
<div class="container">
  <h1>View 2</h1>
</div>
{% endblock %}
```

## Result
At this point, you can run project.

### Run project
```
# with docker
docker exec -it workshop ./workshop/manage.py runserver 0.0.0.0:8000

# without docker
./workshop/manage.py runserver
```

You should see the "View 1" page in your browser at `http://localhost:8000/links/`.
You can change the URL to `http://localhost:8000/links/view2/` and you should see
"View 2".

I'm importing Twitter Bootstrap here because I also want to show that ReactJS
will not stand in your way even if you are already using a complex CSS
framework. More on this in a later step.

[Step 4: Add django models](/en/step4_add_django_models)
