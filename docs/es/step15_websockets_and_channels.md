# Paso 15: Django channels y websockets

[Volver al paso 14](/es/step14_api_rest)

En este paso vamos a agregar data binding con [django channels](http://channels.readthedocs.io/en/latest/getting-started.html) y tomar los datos desde React con [react-websocket](https://www.npmjs.com/package/react-websocket)

## Agregar data binding en Django (con channels)

### Instalar django channels
```bash
# con docker
docker exec -it workshop pip install channels

# sin docker
pip install channels
```

### Actualizar requirements
Usamos requirements porque estas dependencias son dependencias de producción.
```bash
# con docker
docker exec -it workshop pip freeze | grep channels >> requirements.txt

# sin docker
pip freeze | grep channels >> requirements.txt
```

### Agregar channels a la configuración de Django
En `workshop/workshop/settings.py` lo agregamos a **INSTALLED_APPS**
```diff
INSTALLED_APPS = [
    ...
    'django.contrib.staticfiles',
    'links',
    'webpack_loader',
    'rest_framework',
+   'channels',
]
```

Al final del archivo de settings, agregamos la configuración:
```diff
+
+CHANNEL_LAYERS = {
+    "default": {
+        "BACKEND": "asgiref.inmemory.ChannelLayer",
+        "ROUTING": "workshop.routing.channel_routing",
+    },
+}
```

### Agregar clases para binding de los modelos
En el archivo `workshop/links/bindings.py`:
```python
"""
   Bindings module
"""
# pylint: disable=missing-docstring

from channels.binding.websockets import WebsocketBinding

from .models import Link, Tag, LinkTag


class LinkBinding(WebsocketBinding):
    model = Link
    stream = 'links'
    fields = ['id', 'name', 'url', 'pending',
              'description', 'tags', 'user']

    @classmethod
    def group_names(cls, instance):
        return ['link-updates']

    def has_permission(self, user, action, pk):
        return True


class LinkTagBinding(WebsocketBinding):
    model = LinkTag
    stream = 'linktags'
    fields = ['id', 'link', 'tag']

    @classmethod
    def group_names(cls, instance):
        return ['linktags-updates']

    def has_permission(self, user, action, pk):
        return True


class TagBinding(WebsocketBinding):
    model = Tag
    stream = 'tags'
    fields = ['id', 'name', 'description', 'user']

    @classmethod
    def group_names(cls, instance):
        return ['tags-updates']

    def has_permission(self, user, action, pk):
        return True
```

### Agregar rutas para los bindings
En el archivo `workshop/workshop/routing.py`:
```python
"""
   Routing Module with all Demultiplexers and channel_routing for djnago-channels
"""
# pylint: disable=missing-docstring

from channels.generic.websockets import WebsocketDemultiplexer
from channels.routing import route_class

from links.bindings import LinkBinding, TagBinding, LinkTagBinding


class APIDemultiplexer(WebsocketDemultiplexer):
    consumers = {
        'links': LinkBinding.consumer,
        'tags': TagBinding.consumer,
        'linktags': LinkTagBinding.consumer,
    }

    def connection_groups(self, **kwargs):
        return ['link-updates', 'tag-updates', 'linktag-updates']


class LinkTagDemultiplexer(WebsocketDemultiplexer):
    consumers = {
        'linktags': LinkTagBinding.consumer
    }

    def connection_groups(self, **kwargs):
        return ['linktag-updates']


class LinkDemultiplexer(WebsocketDemultiplexer):
    consumers = {
        'links': LinkBinding.consumer
    }

    def connection_groups(self, **kwargs):
        return ['link-updates']


class TagDemultiplexer(WebsocketDemultiplexer):
    consumers = {
        'tags': TagBinding.consumer
    }

    def connection_groups(self, **kwargs):
        return ['tag-updates']


# pylint: disable=invalid-name
channel_routing = [
    route_class(APIDemultiplexer, path='^/updates/$'),
    route_class(LinkTagDemultiplexer, path='^/updates/linktags/$'),
    route_class(LinkDemultiplexer, path='^/updates/links/$'),
    route_class(TagDemultiplexer, path='^/updates/tags/$'),
]
```

## Agregar websockets a React

### Agregar urls
En `workshop/front/src/utils/urls.js`:
```diff
export const API_URL = '/links/api/'
export const LINKS_API_URL = `${API_URL}links/`
+
+export const WS_URL = `ws://${window.location.host}/`
+export const LINKS_WS_URL = `${WS_URL}updates/links/`
```

### Agregar react-websocket a la pagina de links
Remplazar el archivo `workshop/front/src/containers/LinksDetail/index.jsx` con:
```javascript
import React from 'react'
import PropTypes from 'prop-types';
import Websocket from 'react-websocket';

import LinksDetailComponent from '../../components/LinksDetail'
import { LINKS_API_URL, LINKS_WS_URL } from '../../utils/urls'
import { getUrl } from '../../utils/api'


export default class LinksDetail extends React.Component {
  static propTypes = {
    links: PropTypes.array.isRequired
  }

  constructor(props) {
    super(props);
    const { links } = this.props;
    this.state = {
      links: [...links]
    }
  }

  getLink = (id, fields) => {return {id, fields}};

  _onRefresh = () => {
    getUrl(LINKS_API_URL)
      .then(newLinks => {
        const links = newLinks.map(link => this.getLink(link.id, link));
        this.setState({links});
      })
  }

  _onUpdate = event => {
    const { links } = this.state;
    const {payload: {action, data, pk}} = JSON.parse(event);
    let newLinks = [...links];
    switch (action) {
      case 'update':
        newLinks = newLinks.map(link => {
          if (link.pk === pk) return this.getLink(pk, data);
          return link;
        })
        break;
      case 'create':
        newLinks.push(this.getLink(pk, data))
        break;
     case 'delete':
        newLinks = newLinks.filter(link => link.pk !== pk);
        break;
    }
    this.setState({links: newLinks});
  }

  render() {
    const { links } = this.state;
    return (
      <div>
        <LinksDetailComponent links={links} onRefresh={this._onRefresh}/>
        <Websocket url={LINKS_WS_URL} onMessage={this._onUpdate}/>
      </div>
    )
  }
}
```

## Actualizar test
Como esto es no tan impotante en este paso, esta en otro archivo.
Si queres ver como se actualizaron los tests podes verlo en [Actualización de tests](https://gitlab.com/FedeG/django-react-workshop/blob/step15_websockets_and_channels/TESTUPDATE-es.md)


## Resultado
En este punto, ya podemos ejecutar el servidor, ver la lista de links en `http://localhost:8000/links/`.

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
Podes probar de cambiar algo en el admin (en `http://localhost:8000/admin/links/link/`) y automaticamente se va a cambiar en el frontend. Podes probar creando, borrando o modificando links en el admin.

[Paso 16: Agregar Redux](/es/step16_add_redux)
