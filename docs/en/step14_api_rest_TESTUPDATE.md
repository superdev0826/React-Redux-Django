# Update testing for new features

## Button Tests
In **workshop/front/src/components/Button/Button.spec.jsx**:
```javascript
import React from 'react';
import Button from './index.jsx';
import { shallow } from 'enzyme';

describe('Button Component', () => {
  let label, onClick;

  beforeAll(() => {
    label = 'label';
    onClick = () => {};
  })

  describe('props', () => {

    it('should declare propsTypes', () => {
      expect(Object.keys(Button.propTypes)).toHaveLength(2);
      expect(Button.propTypes).toHaveProperty('label');
      expect(Button.propTypes).toHaveProperty('onClick');
    })

  })

  describe('#render', () => {

    it('should render the component properly', () => {
      const wrapper = shallow(<Button label={label} onClick={onClick}/>);
      const componentInDOM = `<button class="btn btn-success" type="button">${label}</button>`;
      expect(wrapper.html()).toBe(componentInDOM);
    })

  })

})
```

## Api Tests
In **workshop/front/src/utils/api.spec.js**:
```javascript
import { getUrl } from './api.js';

describe('Api utils', () => {
  let url;

  beforeAll(() => {
    url = '/links/api/';
  })

  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve([])
      })
    );
  });

  afterAll(() => {
    global.fetch.reset();
    global.fetch.restore();
  })

  describe('get', () => {

    it('should API_URL is /links/api/', async () => {
      await getUrl(url);
      expect(global.fetch).toBeCalled();
      expect(global.fetch).lastCalledWith(url);
    })

  })

})
```

## Utls Tests
In **workshop/front/src/utils/urls.spec.js**:
```javascript
import { API_URL, LINKS_API_URL } from './urls.js';

describe('Url utils', () => {

  describe('API_URL', () => {

    it('should API_URL is /links/api/', () => {
      expect(API_URL).toEqual('/links/api/');
    })

  })

  describe('LINKS_API_URL', () => {

    it('should LINKS_API_URL is /links/api/links/', () => {
      expect(LINKS_API_URL).toEqual('/links/api/links/');
    })

  })

})
```

## Update old React tests
In **workshop/front/src/components/LinksDetail/LinksDetail.spec.jsx**:
```diff
   describe('props', () => {

     it('should declare propsTypes', () => {
-      expect(Object.keys(LinksDetail.propTypes)).toHaveLength(1);
+      expect(Object.keys(LinksDetail.propTypes)).toHaveLength(2);
       expect(LinksDetail.propTypes).toHaveProperty('links');
+      expect(LinksDetail.propTypes).toHaveProperty('onRefresh');
     })

   })

   ...

   describe('#render', () => {

     it('should render the component properly', () => {
-      const wrapper = shallow(<LinksDetail links={links}/>);
+      const wrapper = shallow(<LinksDetail links={links} onRefresh={() => {}}/>);
       const itemInDOM = `<p>${link.fields.name}: <a href="${link.fields.url}">${link.fields.url}</a></p>`;
-      const componentInDOM = `<div class="container"><div class="row"><div class="col-sm-12"><h1>Links</h1>${itemInDOM}</div></div></div>`;
+      const button = '<button class="btn btn-success" type="button">Refresh</button>';
+      const componentInDOM = `<div class="container"><div class="row"><div class="col-sm-12"><h1>Links</h1>${button}<div style="margin-top:20px">${itemInDOM}</div></div></div></div>`;
       expect(wrapper.html()).toBe(componentInDOM);
     })
```

In **workshop/front/src/containers/LinksDetail/LinksDetail.spec.jsx**:
```diff
     it('should render the component properly', () => {
       const wrapper = shallow(<LinksDetail links={links}/>);
       const itemInDOM = `<p>${link.fields.name}: <a href="${link.fields.url}">${link.fields.url}</a></p>`;
-      const componentInDOM = `<div class="container"><div class="row"><div class="col-sm-12"><h1>Links</h1>${itemInDOM}</div></div></div>`;
+      const button = '<button class="btn btn-success" type="button">Refresh</button>';
+      const componentInDOM = `<div class="container"><div class="row"><div class="col-sm-12"><h1>Links</h1>${button}<div style="margin-top:20px">${itemInDOM}</div></div></div></div>`;
       expect(wrapper.html()).toBe(componentInDOM);
     })
```

## Update eslint config
In **workshop/front/.eslintrc.yaml**:
```diff
globals:
 gettext: true
 $: true
 module: true
 process: true
 __dirname: true
+global: true
```
