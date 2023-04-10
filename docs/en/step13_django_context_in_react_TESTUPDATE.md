## Update testing for new features

### Django views
In **workshop/links/tests/test_views.py**:
```python
from django_dynamic_fixture import G
from django.core import serializers

import pytest

from links.models import Link


@pytest.mark.client
@pytest.mark.django_db
def test_links_detail_view_without_links(client):
    response = client.get('/links/')
    assert 200 == response.status_code
    assert str([]) == response.context[-1]['links']


@pytest.mark.client
@pytest.mark.django_db
def test_links_detail_view_with_links(client):
    link_workshop = G(
        Link,
        name='Gitlab with workshop',
        url='https://gitlab.com/FedeG/django-react-workshop/')
    links_json = serializers.serialize('json', [link_workshop])
    response = client.get('/links/')
    assert 200 == response.status_code
    assert links_json == response.context[-1]['links']

```

### Update React tests
In **workshop/front/src/components/LinksDetail/LinksDetail.spec.jsx**:
```diff
import React from 'react';
-import App from './index.jsx';
+import LinksDetail from './index.jsx';
import { shallow } from 'enzyme';

-describe('App Component', () => {
+describe('LinksDetail Component', () => {
+  let links, link;
+
+  beforeAll(() => {
+    link = {
+      model: 'links.link',
+      pk: 1,
+      fields: {
+        name: 'Gitlab with workshop',
+        url: 'https://gitlab.com/FedeG/django-react-workshop/',
+        pending: false,
+        description: '',
+        user: 1
+      }
+    }
+    links = [link]
+  })
+
+  describe('props', () => {
+
+    it('should declare propsTypes', () => {
+      expect(Object.keys(LinksDetail.propTypes)).toHaveLength(1);
+      expect(LinksDetail.propTypes).toHaveProperty('links');
+    })
+
+  })

  describe('#render', () => {

    it('should render the component properly', () => {
-      const wrapper = shallow(<App/>);
-      const componentInDOM = '<div class="container"><div class="row"><div class="col-sm-12"><h1>Sample App!</h1></div></div></div>';
+      const wrapper = shallow(<LinksDetail links={links}/>);
+      const itemInDOM = `<p>${link.fields.name}: <a href="${link.fields.url}">${link.fields.url}</a></p>`;
+      const componentInDOM = `<div class="container"><div class="row"><div class="col-sm-12"><h1>Links</h1>${itemInDOM}</div></div></div>`;
      expect(wrapper.html()).toBe(componentInDOM);
    })
```

In **workshop/front/src/containers/LinksDetail/LinksDetail.spec.jsx**:
```diff
import React from 'react';
-import App from './App.jsx';
+import LinksDetail from './index.jsx';
import { shallow } from 'enzyme';

-describe('App Component', () => {
+describe('LinksDetail Component', () => {
+  let links, link;
+
+  beforeAll(() => {
+    link = {
+      model: 'links.link',
+      pk: 1,
+      fields: {
+        name: 'Gitlab with workshop',
+        url: 'https://gitlab.com/FedeG/django-react-workshop/',
+        pending: false,
+        description: '',
+        user: 1
+      }
+    }
+    links = [link]
+  })
+
+  describe('props', () => {
+
+    it('should declare propsTypes', () => {
+      expect(Object.keys(LinksDetail.propTypes)).toHaveLength(1);
+      expect(LinksDetail.propTypes).toHaveProperty('links');
+    })
+
+  })

  describe('#render', () => {

    it('should render the component properly', () => {
-      const wrapper = shallow(<App/>);
-      const componentInDOM = '<div class="container"><div class="row"><div class="col-sm-12"><h1>Sample App!</h1></div></div></div>';
+      const wrapper = shallow(<LinksDetail links={links}/>);
+      const itemInDOM = `<p>${link.fields.name}: <a href="${link.fields.url}">${link.fields.url}</a></p>`;
+      const componentInDOM = `<div class="container"><div class="row"><div class="col-sm-12"><h1>Links</h1>${itemInDOM}</div></div></div>`;
      expect(wrapper.html()).toBe(componentInDOM);
    })
```

#### Add LinkDetail tests
In **workshop/front/src/components/LinkDetail/LinkDelail.spec.jsx**:
```javascript
import React from 'react';
import LinkDetail from './index.jsx';
import { shallow } from 'enzyme';

describe('LinkDetail Component', () => {
  let link;

  beforeAll(() => {
    link = {
      model: 'links.link',
      pk: 1,
      fields: {
        name: 'Gitlab with workshop',
        url: 'https://gitlab.com/FedeG/django-react-workshop/',
        pending: false,
        description: '',
        user: 1
      }
    }
  })

  describe('props', () => {

    it('should declare propsTypes', () => {
      expect(Object.keys(LinkDetail.propTypes)).toHaveLength(1);
      expect(LinkDetail.propTypes).toHaveProperty('link');
    })

  })

  describe('#render', () => {

    it('should render the component properly', () => {
      const wrapper = shallow(<LinkDetail link={link}/>);
      const componentInDOM = `<p>${link.fields.name}: <a href="${link.fields.url}">${link.fields.url}</a></p>`;
      expect(wrapper.html()).toBe(componentInDOM);
    })

  })

})
```
