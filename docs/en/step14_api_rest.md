# Step 14: Api rest

[Back to step 13](/en/step13_django_context_in_react)

In this step, we will add a rest api in Django with [djangorestframework](http://www.django-rest-framework.org/) and take data from React with `fetch`

## Add rest api to Django

### Install djangorestframework
If you want, you could use official documentation: [installation](http://www.django-rest-framework.org/#installation)
```bash
# with docker
docker exec -it workshop pip install djangorestframework markdown django-filter

# without docker
pip install djangorestframework markdown django-filter
```

### Update requirements
We use requirements because these are production dependencies.
```bash
# with docker
docker exec -it workshop pip freeze | grep rest >> requirements.txt
docker exec -it workshop pip freeze | grep filter >> requirements.txt

# without docker
pip freeze | grep rest >> requirements.txt
pip freeze | grep filter >> requirements.txt
```

### Add django-rest-framework in Django settings
In `workshop/workshop/settings.py`, add **rest-framework** in **INSTALLED_APPS**
```diff
INSTALLED_APPS = [
    ...
    'django.contrib.staticfiles',
    'links',
    'webpack_loader',
+   'rest_framework',
]
```

And append rest-framework configuration:
```diff
+
+REST_FRAMEWORK = {
+    'DEFAULT_PERMISSION_CLASSES': [
+        'rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly'
+    ]
+}
```

### Add serializers and viewsets
The serializers say 'how' show a model in the api and the viewset say 'where' search the data for show.
The viewset and serializers documentation:
- Viewsets: http://www.django-rest-framework.org/api-guide/viewsets/
- Serializers: http://www.django-rest-framework.org/api-guide/serializers/

In the `workshop/links/api.py` file:
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

### Add api to urls
In `workshop/links/urls.py`:
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

## Create button for update data

### Create Button component
In `workshop/front/src/components/Button/index.jsx`:
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

### Create util for fetch data from api
In `workshop/front/src/utils/api.js`:
```javascript
export function getUrl(url){
  return fetch(url).then(resp => resp.json())
}
```

### Create util with api urls
In `workshop/front/src/utils/urls.js`:
```javascript
export const API_URL = '/links/api/'
export const LINKS_API_URL = `${API_URL}links/`
```

### Add Button component in linkDetails page
In `workshop/front/src/components/LinksDetail/index.jsx`:
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

### Add callback for click event (for update links data)
In `workshop/front/src/containers/LinksDetail/index.jsx`:
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

## Update test
As this isn't so important in this step is in another file, if you want to see how the tests were updated you can see this in [Update tests](https://g
itlab.com/FedeG/django-react-workshop/blob/step14_api_rest/TESTUPDATE.md)


## Result
At this point, we could run the server, see the links list at `http://localhost:8000/links/` and see refresh button

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

You should see the links detail page with the links (that you have loaded) in the browser in `http://localhost:8000/links/` and the refresh button.
You could try change link data in Django admin (in `http://localhost:8000/admin/links/link/`) and use **Refresh** button for update this data in frontend.

[Step 15: Django channels and websockets](/en/step15_websockets_and_channels)
