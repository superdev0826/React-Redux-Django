# Step 13: Django context in React

[Back to step 12](/en/step12_react_testing)

## Details
In this step we will make an important change in the files that we currently have.
First thing is change names to more intuitive names for the components, containers and views.
The second thing is add title and links list in **http://localhost:8000/links/**.

## Change names:
We are going to change App to LinksDetail in some files:

### Move files

```bash
# Components
mkdir workshop/front/src/components/LinksDetail
mv workshop/front/src/components/App/App.spec.jsx workshop/front/src/components/LinksDetail/LinksDetail.spec.jsx
mv workshop/front/src/components/App/index.jsx workshop/front/src/components/LinksDetail/index.jsx
rm -r workshop/front/src/components/App

# Containers
mkdir workshop/front/src/containers/LinksDetail
mv workshop/front/src/containers/App.spec.jsx workshop/front/src/containers/LinksDetail/LinksDetail.spec.jsx
mv workshop/front/src/containers/App.jsx workshop/front/src/containers/LinksDetail/index.jsx

# Ciews
mv workshop/front/src/views/App.jsx workshop/front/src/views/LinksDetail.jsx

# Django Templates
mv workshop/links/templates/view1.html workshop/links/templates/link_detail.html
```

### Change names in the code
In the **LinksDetail** view (**workshop/front/src/views/LinksDetail.jsx**):
```diff
import React from 'react'
import { render } from 'react-dom'
-import App from '../containers/App'
+import LinksDetail from '../containers/LinksDetail'

-render(<App/>, document.getElementById('app'))
+render(<LinksDetail/>, document.getElementById('app'))

if (module.hot) module.hot.accept();
```

In the **LinksDetail** container (**workshop/front/src/containers/LinksDetail/index.jsx**):
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

In the **LinksDetail** component (**workshop/front/src/components/LinksDetail/index.jsx**):
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

### Update webpack configuration
In **workshop/front/webpack.base.config.js**:
```diff
entry: {
    // Add as many entry points as you have container-react-components here
-   App: ['./src/views/App'],
+   LinksDetail: ['./src/views/LinksDetail'],
    vendors: ['react', 'babel-polyfill'],
  },
```

In **workshop/front/webpack.local.config.js**:
```diff
// Use webpack dev server
config.entry = {
- App: addDevVendors('./src/views/App'),
+ LinksDetail: addDevVendors('./src/views/LinksDetail'),
  vendors: ['react', 'babel-polyfill'],
}
```

### Update link_detail template
In **workshop/links/templates/link_detail.html**:
```diff
  {% render_bundle 'vendors' %}
- {% render_bundle 'App' %}
+ {% render_bundle 'LinksDetail' %}
```

## Create links detail page with the links list

### Add title
In **workshop/links/templates/base.html**:
```diff
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    ...
+    {% block head %}{% endblock %}
  </head>
```

In **workshop/links/templates/link_detail.html**:
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

## Take Django context in React
We are going to create a function **render_components**.
The function **render_components** is called in the Django template with the
parameters that we want to pass to React.
Let's create it in **workshop/front/src/views/LinksDetail.jsx**:
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
Note: the **LinksDetail** component is recive the links from the properties that were sent to the function **render_components**.

### Add links parameter to LinksDetail container and LinksDetail component

In **workshop/front/src/containers/LinksDetail/index.jsx**:
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

In **workshop/front/src/components/LinksDetail/index.jsx**:
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

## Send context from Django

### Django view
We will add a Django view for send the links list.
In **workshop/links/views.py**:
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

### Add the view that we created to urls
In **workshop/links/urls.py**:
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

### Send Django context from template to React
In **workshop/links/templates/link_detail.html**:
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

## Show links in the LinksDetail screen
We are going to create a component to show a link (with detail).
In **workshop/front/src/components/LinkDetail/index.jsx**:
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

### Add LinkDetail to LinksDetail
In **workshop/front/src/components/LinksDetail/index.jsx**:

#### Import LinkDetail
 ```diff
 import Headline from '../Headline'
+import LinkDetail from '../LinkDetail'
```

#### Show LinkDetail for each link
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

## Update test
As this isn't so important in this step is in another file, if you want to see how the tests were updated you can see this in [Update tests](https://gitlab.com/FedeG/django-react-workshop/blob/step13_django_context_in_react/TESTUPDATE-es.md)

## Result
At this point, we could run the server and see the links list at `http://localhost:8000/links/`

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

[Step 14: Api rest](/en/step14_api_rest)
