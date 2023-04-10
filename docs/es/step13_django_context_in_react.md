# Paso 13: Contexto de Django en react

[Volver al paso 12](/es/step12_react_testing)

## Detalles
En este paso vamos a hacer un cambio importante en los archivos que actualmente tenemos.
Lo primero es poner nombres mas intuitivos para las componentes, containers y vistas de React.
Lo segundo es agregar en **http://localhost:8000/links/** en titulo y la lista de los links que tenemos.

## Cambio de nombres:
Vamos a cambiar App por LinksDetail en varias partes:

### Mover archivos

```bash
# Componentes
mkdir workshop/front/src/components/LinksDetail
mv workshop/front/src/components/App/App.spec.jsx workshop/front/src/components/LinksDetail/LinksDetail.spec.jsx
mv workshop/front/src/components/App/index.jsx workshop/front/src/components/LinksDetail/index.jsx
rm -r workshop/front/src/components/App

# Contenedores
mkdir workshop/front/src/containers/LinksDetail
mv workshop/front/src/containers/App.spec.jsx workshop/front/src/containers/LinksDetail/LinksDetail.spec.jsx
mv workshop/front/src/containers/App.jsx workshop/front/src/containers/LinksDetail/index.jsx

# Vistas
mv workshop/front/src/views/App.jsx workshop/front/src/views/LinksDetail.jsx

# Templates de django
mv workshop/links/templates/view1.html workshop/links/templates/link_detail.html
```

### Cambiar el nombre en el codigo js
En la vista de **LinksDetail** (**workshop/front/src/views/LinksDetail.jsx**):
```diff
import React from 'react'
import { render } from 'react-dom'
-import App from '../containers/App'
+import LinksDetail from '../containers/LinksDetail'

-render(<App/>, document.getElementById('app'))
+render(<LinksDetail/>, document.getElementById('app'))

if (module.hot) module.hot.accept();
```

En el contenedor de **LinksDetail** (**workshop/front/src/containers/LinksDetail/index.jsx**):
```diff
import React from 'react'

-import AppComponent from '../components/App'
+import LinksDetailComponent from '../../components/LinksDetail'


-export default class App extends React.Component {
+export default class LinksDetail extends React.Component {
  render() {
    return (
-     <AppComponent />
+     <LinksDetailComponent />
    )
  }
}
```

En la componente de **LinksDetail** (**workshop/front/src/components/LinksDetail/index.jsx**):
```diff
import React from 'react'

import Headline from '../Headline'

-export default class App extends React.Component {
+export default class LinksDetail extends React.Component {
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <Headline>Sample App!</Headline>
          </div>
        </div>
      </div>
```

### Actualizar configuración de webpack
En **workshop/front/webpack.base.config.js**:
```diff
entry: {
    // Add as many entry points as you have container-react-components here
-   App: ['./src/views/App'],
+   LinksDetail: ['./src/views/LinksDetail'],
    vendors: ['react', 'babel-polyfill'],
  },
```

En **workshop/front/webpack.local.config.js**:
```diff
// Use webpack dev server
config.entry = {
- App: addDevVendors('./src/views/App'),
+ LinksDetail: addDevVendors('./src/views/LinksDetail'),
  vendors: ['react', 'babel-polyfill'],
}
```

### Actualizar la template de link_detail
En **workshop/links/templates/link_detail.html**:
```diff
  {% render_bundle 'vendors' %}
- {% render_bundle 'App' %}
+ {% render_bundle 'LinksDetail' %}
```

## Crear la pagina de links con la lista de links

### Agregar el titulo a la pagina
En **workshop/links/templates/base.html**:
```diff
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    ...
+    {% block head %}{% endblock %}
  </head>
```

En **workshop/links/templates/link_detail.html**:
```diff
{% extends "base.html" %}
{% load render_bundle from webpack_loader %}

+{% block head %}
+  <title>Links Detail</title>
+{% endblock %}
+
{% block main %}
  <div id="app"></div>
```

## Tomar contexto de Django en React
Vamos a crear una función (**render_components**) que nos va permitir pasarle
parametros a las componentes.
La función **render_components** es llamada en la template de Django con los
parametros que queremos pasarle a React.
Vamos a crearla en **workshop/front/src/views/LinksDetail.jsx**:
```diff
import LinksDetail from '../containers/LinksDetail'

-render(<LinksDetail/>, document.getElementById('app'))
+window.render_components = properties => {
+  window.params = {...properties};
+  render(<LinksDetail links={properties.links}/>, document.getElementById('app'));
+};

-if (module.hot) module.hot.accept();
+if (module.hot) {
+  if (window.params) window.render_components(window.params);
+  module.hot.accept();
+}
```
Nota: a la componente **LinksDetail** se le esta pasando el parametro links que
viene en las properties que se le mandaron a la función **render_components**

### Agregar el parametro links al container y a la componente **LinksDetail**

En **workshop/front/src/containers/LinksDetail/index.jsx**:
```diff
import React from 'react'
+import PropTypes from 'prop-types';

import LinksDetailComponent from '../../components/LinksDetail'

export default class LinksDetail extends React.Component {
+ static propTypes = {
+   links: PropTypes.array
+ }
+
  render() {
+   const { links } = this.props;
    return (
-     <LinksDetailComponent />
+     <LinksDetailComponent links={links} />
    )
  }
}
```

En **workshop/front/src/components/LinksDetail/index.jsx**:
```diff
import React from 'react'
+import PropTypes from 'prop-types';

import Headline from '../Headline'

export default class LinksDetail extends React.Component {
+  static propTypes = {
+    links: PropTypes.arrayOf(
+      PropTypes.shape({
+        pk: PropTypes.number
+      })
+    )
+  }
+
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
-            <Headline>Sample App!</Headline>
+            <Headline>Links</Headline>
          </div>
        </div>
      </div>
```

## Enviar contexto desde Django

### Vista de Django
Vamos a agregar una vista de Django para enviar la lista de links.
En **workshop/links/views.py**:
```python
"""
    Django views for link application
"""
from django.shortcuts import render
from django.core import serializers
from .models import Link


def links_detail(request):
    """
        Links list
    """
    links = Link.objects.all()
    links_json = serializers.serialize('json', links)
    return render(
        request,
        'link_detail.html',
        context={
            'links': links_json
        })
```

### Agregar la url para la vista que creamos
En **workshop/links/urls.py**:
```diff
from django.urls import path
from django.views import generic
from . import views

urlpatterns = [
    path('view2/',
        generic.TemplateView.as_view(template_name='view2.html')),
-    path('view2/',
-        generic.TemplateView.as_view(template_name='view2.html')),
+    path('', views.links_detail)
]
```

### Enviar desde la template el contexto a React
En **workshop/links/templates/link_detail.html**:
```diff
  {% render_bundle 'vendors' %}
  {% render_bundle 'LinksDetail' %}
+ <script>
+    window.render_components({
+      links: {{ links|safe }}
+    });
+  </script>
{% endblock %}
```

## Mostrar los links en la pantalla de Links Detail
Vamos a crear una componente para mostrar el detalle de un link.
En **workshop/front/src/components/LinkDetail/index.jsx**:
```javascript
import React from 'react'
import PropTypes from 'prop-types';

export default class LinkDetail extends React.Component {
  static propTypes = {
    link: PropTypes.shape({
      fields: PropTypes.shape({
        url: PropTypes.string,
        name: PropTypes.string,
      })
    })
  }

  render() {
    const { link } = this.props;
    return (
      <p>
        {link.fields.name}: <a href={link.fields.url}>{link.fields.url}</a>
      </p>
    )
  }
}
```

### Agregar LinkDetail a LinksDetail
En **workshop/front/src/components/LinksDetail/index.jsx**:

#### Importar LinkDetail
 ```diff
 import Headline from '../Headline'
+import LinkDetail from '../LinkDetail'
```

#### Mostrar LinkDetail de cada link
```diff
   render() {
+    const { links } = this.props;
+    const linksItems = links.map(link => <LinkDetail key={link.pk} link={link} />);
     return (
       <div className="container">
         <div className="row">
           <div className="col-sm-12">
             <Headline>Links</Headline>
+            { linksItems }
           </div>
         </div>
       </div>
```

## Actualizar test
Como esto es no tan impotante en este paso esta en otro archivo, si queres ver como se actualizaron los tests podes verlo en [Actualización de tests](https://gitlab.com/FedeG/django-react-workshop/blob/step13_django_context_in_react/TESTUPDATE-es.md)

## Resultado
En este punto, ya podemos ejecutar el servidor y ver la lista de links en `http://localhost:8000/links/`

### En una terminal corremos el servidor de React
```bash
# con docker
docker exec -it workshopjs npm start

# sin docker
cd workshop/front
npm start
```

### En otra terminal corremos el servidor de Django
```bash
# con docker
docker exec -it workshop ./workshop/manage.py runserver 0.0.0.0:8000

# sin docker
./workshop/manage.py runserver
```

Deberías ver la página de links detail con los links que tengas cargados en el navegador en `http://localhost:8000/links/`.

[Paso 14: Api rest](/es/step14_api_rest)
