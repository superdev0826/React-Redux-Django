# Actualizar testing para las nuevas funcionalidades

## Instalar mock-socket
```bash
# con docker
docker exec -it workshopjs yarn add mock-socket --save-dev

# sin docker
cd workshop/front
yarn add mock-socket --save-dev
```

## Agregar configuración de Jest para websockets
En **workshop/front/jest-setup.js**:
```diff
+import { WebSocket } from 'mock-socket'
import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

+global.WebSocket = WebSocket
global.gettext = jest.fn(text => text)
```

## Actualizar tests urls
En **workshop/front/src/utils/urls.spec.js**:
```javascript
-import { API_URL, LINKS_API_URL } from './urls.js';
+import { API_URL, LINKS_API_URL, WS_URL, LINKS_WS_URL } from './urls.js';

 ...

 describe('Url utils', () => {

+  beforeAll(() => {
+    global.window = {location: {host: 'localhost:8000'}};
+  })

   ...

+  describe('WS_URL', () => {
+
+    it('should is WS_URL is ws://localhost:5000/', () => {
+      expect(WS_URL).toEqual('ws://localhost:5000/');
+    })
+
+  })
+
+  describe('LINKS_WS_URL', () => {
+
+    it('should is LINKS_WS_URL is ws://localhost:5000/update/links/', () => {
+      expect(LINKS_WS_URL).toEqual('ws://localhost:5000/updates/links/');
+    })
+
+  })
+
 })
```

## Actualizar los test del contenedor
En **workshop/front/src/containers/LinksDetail/LinksDetail.spec.jsx**:
```javascript
 describe('LinksDetail Component', () => {
-  let links, link;
+  let links, link, LinksDetailContainerWrapper, LinksDetailContainer;

   beforeAll(() => {
     link = {
@@ -35,10 +35,76 @@ describe('LinksDetail Component', () => {
       const wrapper = shallow(<LinksDetail links={links}/>);
       const itemInDOM = `<p>${link.fields.name}: <a href="${link.fields.url}">${link.fields.url}</a></p>`;
       const button = '<button class="btn btn-success" type="button">Refresh</button>';
-      const componentInDOM = `<div class="container"><div class="row"><div class="col-sm-12"><h1>Links</h1>${button}<div style="margin-top:20px">${itemInDOM}</div></div></div></div>`;
+      const componentInDOM = `<div><div class="container"><div class="row"><div class="col-sm-12"><h1>Links</h1>${button}<div style="margin-top:20px">${itemInDOM}</div></div></div></div><div></div></div>`;
       expect(wrapper.html()).toBe(componentInDOM);
     })

   })

+  describe('state', () => {
+    let linkEvent, linkUpdate, linkCreate, linkDelete;
+
+    beforeAll(() => {
+      linkEvent = {
+        stream: 'links',
+        payload: {
+          action: 'update',
+          pk: 1,
+          data: {
+            name: 'Extra fields on many to many',
+            url: 'https://docs.djangoproject.com/en/1.11/topics/db/models/#extra-fields-on-many-to-many-relationships',
+            pending: false,
+            description: '',
+            user: 1
+          },
+          model: 'links.link'
+        }
+      };
+      linkUpdate = JSON.parse(JSON.stringify(linkEvent));
+      linkCreate = JSON.parse(JSON.stringify(linkEvent));
+      linkCreate.payload.action = 'create';
+      linkDelete = JSON.parse(JSON.stringify(linkEvent));
+      linkDelete.payload.action = 'delete';
+    })
+
+    beforeEach(() => {
+      LinksDetailContainerWrapper = shallow(<LinksDetail links={links}/>);
+      LinksDetailContainer = LinksDetailContainerWrapper.instance();
+    })
+
+    it('should state have links', () => {
+      expect(LinksDetailContainer.state).toHaveProperty('links');
+      expect(LinksDetailContainer.state.links).toEqual(links);
+    })
+
+    it('when send link create event onUpdate should update link', () => {
+      const updatedLink = LinksDetailContainer.getLink(
+        linkUpdate.payload.pk, linkUpdate.payload.data
+      )
+      const expectedLinks = [updatedLink];
+      LinksDetailContainer._onUpdate(JSON.stringify(linkUpdate));
+      expect(LinksDetailContainer.state).toHaveProperty('links');
+      expect(LinksDetailContainer.state.links).toEqual(expectedLinks);
+    })
+
+    it('when send link create event onUpdate should append link', () => {
+      const createdLink = LinksDetailContainer.getLink(
+        linkUpdate.payload.pk, linkUpdate.payload.data
+      )
+      const expectedLinks = [...links, createdLink];
+      LinksDetailContainer._onUpdate(JSON.stringify(linkCreate));
+      expect(LinksDetailContainer.state).toHaveProperty('links');
+      expect(LinksDetailContainer.state.links).toEqual(expectedLinks);
+    })
+
+    it('when send link delete event onUpdate should remove link', () => {
+      const expectedLinks = [];
+      LinksDetailContainer._onUpdate(JSON.stringify(linkDelete));
+      expect(LinksDetailContainer.state).toHaveProperty('links');
+      expect(LinksDetailContainer.state.links).toEqual(expectedLinks);
+    })
+
+  })
+
```
