# Paso 14: Api rest

[Volver al paso 13](/es/step13_django_context_in_react)

En este paso vamos a agregar una api rest del lado de Django con [djangorestframework](http://www.django-rest-framework.org/) y tomar los datos desde React con `fetch`

## Agregar api rest en Django

### Instalar django rest framework
Si queres podes usar la documentación oficial para instalar: [instalación](http://www.django-rest-framework.org/#installation)
```bash
# con docker
docker exec -it workshop pip install djangorestframework markdown django-filter

# sin docker
pip install djangorestframework markdown django-filter
```

### Actualizar requirements
Usamos requirements porque estas dependencias son dependencias de producción.
```bash
# con docker
docker exec -it workshop pip freeze | grep rest >> requirements.txt
docker exec -it workshop pip freeze | grep filter >> requirements.txt

# sin docker
pip freeze | grep rest >> requirements.txt
pip freeze | grep filter >> requirements.txt
```

### Agregar django-rest-framework a la configuración de Django
En `workshop/workshop/settings.py` lo agregamos a **INSTALLED_APPS**
```diff
INSTALLED_APPS = [
    ...
    'django.contrib.staticfiles',
    'links',
    'webpack_loader',
+   'rest_framework',
]
```

Al final del archivo de settings, agregamos la configuración:
```diff
+
+REST_FRAMEWORK = {
+    'DEFAULT_PERMISSION_CLASSES': [
+        'rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly'
+    ]
+}
```

### Agregar serializers y viewsets
El serializer define como se van a mostrar un modelo en la api y el Viewset define de donde vamos a tomar los datos para mostrar.
La documentación de Viewsets y serializers:
- Viewsets: http://www.django-rest-framework.org/api-guide/viewsets/
- Serializers: http://www.django-rest-framework.org/api-guide/serializers/

En el archivo `workshop/links/api.py`:
```python
"""
    Api module with serializers and viewsets for models
"""
# pylint: disable=too-many-ancestors
# pylint: disable=missing-docstring
from django.contrib.auth.models import User
from rest_framework import serializers, viewsets

from .models import Link, Tag, LinkTag


# Serializers define the API representation.
class LinkTagSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = LinkTag
        fields = ('url', 'link', 'tag')


class LinkSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Link
        fields = ('id', 'url', 'name', 'url', 'pending',
                  'description', 'tags', 'user')


class TagSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'url', 'name', 'description', 'user')


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username', 'email', 'is_staff')


# ViewSets define the view behavior.
class LinkTagViewSet(viewsets.ModelViewSet):
    queryset = LinkTag.objects.all()
    serializer_class = LinkTagSerializer


class LinkViewSet(viewsets.ModelViewSet):
    queryset = Link.objects.all()
    serializer_class = LinkSerializer


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
```

### Agregar api a las urls
En el archivo `workshop/links/urls.py`:
```diff
-from django.conf.urls import url
+from django.conf.urls import url, include
from django.views import generic
+from rest_framework import routers
+
from . import views
+from .api import LinkTagViewSet, LinkViewSet, TagViewSet, UserViewSet
+
+
+# Routers provide a way of automatically determining the URL conf.
+router = routers.DefaultRouter()
+router.register(r'users', UserViewSet)
+router.register(r'links', LinkViewSet)
+router.register(r'tags', TagViewSet)
+router.register(r'linktags', LinkTagViewSet)
+

urlpatterns = [
    path('view2/',
         generic.TemplateView.as_view(template_name='view2.html')),
    path('', views.links_detail),
+   path('api/', include(router.urls))
]
```

## Crear boton para actualizar los datos

### Crear la componente Button
En `workshop/front/src/components/Button/index.jsx`:
```javascript
import React from 'react'
import PropTypes from 'prop-types';

export default class Button extends React.Component {
 static propTypes = {
   onClick: PropTypes.func.isRequired,
   label: PropTypes.string.isRequired
 }

 _onClick = event => {
   event.preventDefault();
   const { onClick } = this.props;
   onClick();
 }

 render() {
   const { label } = this.props;
   return (
     <button className='btn btn-success' type='button' onClick={this._onClick}>
       { label }
     </button>
   )
 }
}
```

### Crear una utils para pedir data de laapi
En `workshop/front/src/utils/api.js`:
```javascript
export function getUrl(url){
  return fetch(url).then(resp => resp.json())
}
```

### Crear una utils con las urls de la api
En `workshop/front/src/utils/urls.js`:
```javascript
export const API_URL = '/links/api/'
export const LINKS_API_URL = `${API_URL}links/`
```

### Agregar el boton la pagina de links
En `workshop/front/src/components/LinksDetail/index.jsx`:
```diff
 import Headline from '../Headline'
 import LinkDetail from '../LinkDetail'
+import Button from '../Button'

 export default class LinksDetail extends React.Component {
   static propTypes = {
+    onRefresh: PropTypes.func.isRequired,
     links: PropTypes.arrayOf(
         ...
   }

   render() {
-    const { links } = this.props;
+    const { links, onRefresh } = this.props;
     const linksItems = links.map(link => <LinkDetail key={link.pk} link={link} />);
     return (
       <div className="container">
         <div className="row">
           <div className="col-sm-12">
             <Headline>Links</Headline>
-            { linksItems }
+            <Button onClick={onRefresh} label='Refresh'/>
+            <div style={{marginTop: 20}}>
+              { linksItems }
+            </div>
           </div>
         </div>
       </div>
```

### Agregar funcionalidad al boton para actualizar links
En `workshop/front/src/containers/LinksDetail/index.jsx`:
```diff
import PropTypes from 'prop-types';

import LinksDetailComponent from '../../components/LinksDetail'
+ import { LINKS_API_URL } from '../../utils/urls'
+ import { getUrl } from '../../utils/api'
+

export default class LinksDetail extends React.Component {

+  constructor(props) {
+    super(props);
+    const { links } = this.props;
+    this.state = {
+      links: [...links]
+    }
+  }
+
+
+  _onRefresh = () => {
+    getUrl(LINKS_API_URL)
+      .then(newLinks => {
+        const links = newLinks.map(link => {
+          return {
+            pk: link.id,
+            fields: link
+          }
+        });
+        this.setState({links});
+      })
+  }

  render() {
    const { links } = this.state;
    return (
-     <LinksDetailComponent links={links} />
+     <LinksDetailComponent links={links} onRefresh={this._onRefresh}/>
    )
  }
}
```

## Actualizar test
Como esto es no tan impotante en este paso, esta en otro archivo.
Si queres ver como se actualizaron los tests podes verlo en [Actualización de tests](https://gitlab.com/FedeG/django-react-workshop/blob/step14_api_rest/TESTUPDATE-es.md)


## Resultado
En este punto, ya podemos ejecutar el servidor, ver la lista de links en `http://localhost:8000/links/` y usar el boton actualizar.

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

Deberías ver la página de links detail con los links que tengas cargados en el navegador en `http://localhost:8000/links/` y el boton para actualizar.
Podes probar de cambiar algo en el admin (en `http://localhost:8000/admin/links/link/`) y tocar el boton **Refresh** para actualizar la lista.

[Paso 15: Django channels y websockets](/es/step15_websockets_and_channels)
