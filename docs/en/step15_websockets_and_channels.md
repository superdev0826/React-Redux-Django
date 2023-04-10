# Step 15: Django channels and websockets

[Back to step 14](/en/step14_api_rest)

In this step, we will add data binding with [django channels](http://channels.readthedocs.io/en/latest/getting-started.html) and take data from React with [react-websocket](https://www.npmjs.com/package/react-websocket)

## Add data binding in Django (with channels)

### Install django channels
```bash
# with docker
docker exec -it workshop pip install channels

# without docker
pip install channels
```

### Update requirements
We use requirements because these are production dependencies.
```bash
# with docker
docker exec -it workshop pip freeze | grep channels >> requirements.txt

# without docker
pip freeze | grep channels >> requirements.txt
```

### Aadd channels in Django settings
In `workshop/workshop/settings.py`, add **channels** in **INSTALLED_APPS**
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

And append channels configuration:
```diff
+
+CHANNEL_LAYERS = {
+    "default": {
+        "BACKEND": "asgiref.inmemory.ChannelLayer",
+        "ROUTING": "workshop.routing.channel_routing",
+    },
+}
```

### Add binding class for each models
In `workshop/links/bindings.py`:
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

### Add routes for each bindings
In `workshop/workshop/routing.py`:
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

## Add websockets to React

### Add urls
In `workshop/front/src/utils/urls.js`:
```diff
export const API_URL = '/links/api/'
export const LINKS_API_URL = `${API_URL}links/`
+
+export const WS_URL = `ws://${window.location.host}/`
+export const LINKS_WS_URL = `${WS_URL}updates/links/`
```

### Add react-websocket in the LinkDetails page
Replace `workshop/front/src/containers/LinksDetail/index.jsx` file with:
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
## Update test
As this isn't so important in this step is in another file, if you want to see how the tests were updated you can see this in [Update tests](https://gitlab.com/FedeG/django-react-workshop/blob/step15_websockets_and_channels/TESTUPDATE.md)

## Result
At this point, we could run the server, see the links list at `http://localhost:8000/links/`.

### In a terminal we run React server
```bash
# with docker
docker exec -it workshopjs npm start

# without docker
cd workshop/front
npm start
```

### In another terminal we run Django server
```bash
# with docker
docker exec -it workshop ./workshop/manage.py runserver 0.0.0.0:8000

# without docker
./workshop/manage.py runserver
```

You should see the links detail page with the links (that you have loaded) in the browser in `http://localhost:8000/links/`.
You could try change link data in Django admin (in `http://localhost:8000/admin/links/link/`) and websocket going to update this data in frontend in real time.
You could try create, delete or update links in the admin page.

[Paso 16: Add Redux](/en/step16_add_redux)
