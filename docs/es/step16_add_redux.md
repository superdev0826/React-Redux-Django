# Paso 16: Agregar redux

[Volver al paso 15](/es/step15_websockets_and_channels)

Este paso es solo una ventaja, de verdad. Es posible que desee utilizar alguna otra implementación de flujo para administrar el estado de sus componentes, pero Redux es realmente agradable de trabajar y el estándar de facto en este momento.
La documentación oficial de Redux es mucho mejor que cualquier cosa que pueda crear, así que podrias leer eso pero en este caso vamos a armar un ejemplo para que veas el funcionamiento de Redux.
Documentación oficial (en español): http://es.redux.js.org/docs/

## Instalar redux

### Instalar redux como dependencia
```bash
# con docker
docker exec -it workshopjs yarn add react-redux redux redux-thunk --save
docker exec -it workshopjs yarn add redux-devtools --save-dev

# sin docker
cd workshop/front
yarn add react-redux redux redux-thunk --save
yarn add redux-devtools --save-dev
```

## Reducers, actions y store de Redux

![concepts](https://d2yei5s1by8ykd.cloudfront.net/wp-content/uploads/2017/03/07151912/a962595e-6313-423c-b45f-b7db5b6af1f4_Screenshot202017-03-072013.20.36.png)
Concepto (en español): [glosario](http://es.redux.js.org/docs/glosario.html)

### Crear acciones
En **workshop/front/src/actions/linksActions.js**:
```javascript
export const SET_LINKS = 'SET_LINKS';
export const UPDATE_LINK = 'UPDATE_LINK';
export const DELETE_LINK = 'DELETE_LINK';
export const CREATE_LINK = 'CREATE_LINK';

export function setLinks(links){
  return {
    type: SET_LINKS,
    links
  }
}

export function updateLink(link){
  return {
    type: UPDATE_LINK,
    link
  }
}

export function deleteLink(link){
  return {
    type: DELETE_LINK,
    link
  }
}

export function createLink(link){
  return {
    type: CREATE_LINK,
    link
  }
}

const linksActions = {
  setLinks,
  createLink,
  updateLink,
  deleteLink,
  DELETE_LINK,
  CREATE_LINK,
  UPDATE_LINK,
  SET_LINKS
}
export default linksActions
```

### Crear reducers
En **workshop/front/src/reducers/index.js**:
```javascript
import { combineReducers } from 'redux'
import links from './links'

export default combineReducers({
  links
})
```

En **workshop/front/src/reducers/links.js**:
```javascript
import {
  SET_LINKS,
  UPDATE_LINK,
  DELETE_LINK,
  CREATE_LINK,
} from '../actions/linksActions'
import { getLink } from '../utils/links'

const initState = {
  links: []
}

export default (state = initState, action) => {
  const { links } = state;
  switch (action.type) {
    case SET_LINKS:
      return {
        ...state,
        links: action.links
      };
    case UPDATE_LINK:
      return {
        ...state,
        links: links.map(link => {
          if (link.pk === action.link.pk) {
            return getLink(action.link.pk, action.link.data);
          }
          return link;
        })
      };
    case CREATE_LINK:
      return {
        ...state,
        links: [...links, getLink(action.link.pk, action.link.data)]
      };
    case DELETE_LINK:
      return {
        ...state,
        links: links.filter(link => link.pk !== action.link.pk)
      };
    default:
      return state;
  }
}
```

### Crear store
En **workshop/front/src/store/linksStore.js**:
```javascript
import {compose, createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import reducer from '../reducers'


export default function linksStore() {
  const middleware = compose(applyMiddleware(thunk));
  const store = createStore(reducer, middleware);
  return store;
}
```

### Agregar una nueva utils con funciones para links
En **workshop/front/src/utils/links.js**:
```javascript
export function getLink(pk, fields){
  return {pk, fields}
}
```

## Agregar provider a la vista
En **workshop/front/src/views/LinksDetail.jsx**:
```diff
 import React from 'react'
 import { render } from 'react-dom'
 import LinksDetail from '../containers/LinksDetail'
+import {Provider} from 'react-redux'
+import linksStore from '../store/linksStore'

+const store = linksStore();
 window.render_components = properties => {
   window.params = {...properties};
-  render(<LinksDetail links={properties.links}/>, document.getElementById('app'));
+  render(
+    (<Provider store={store}>
+       <LinksDetail initialLinks={properties.links}/>
+    </Provider>), document.getElementById('app'));
 };
```

## Conectar contenedor a Redux
En el archivo **workshop/front/src/containers/LinksDetail/index.jsx** ponemos:
```javascript
import React from 'react'
import PropTypes from 'prop-types';
import Websocket from 'react-websocket';
import { connect } from 'react-redux'
import { setLinks, createLink, updateLink, deleteLink } from '../../actions/linksActions'

import LinksDetailComponent from '../../components/LinksDetail'
import { LINKS_API_URL, LINKS_WS_URL } from '../../utils/urls'
import { getUrl } from '../../utils/api'


export class LinksDetail extends React.Component {
  static propTypes = {
    links: PropTypes.array.isRequired,
    setLinks: PropTypes.func.isRequired,
    createLink: PropTypes.func.isRequired,
    updateLink: PropTypes.func.isRequired,
    deleteLink: PropTypes.func.isRequired,
    initialLinks: PropTypes.array.isRequired,
  }

  constructor(props) {
    super(props);
    const { initialLinks } = this.props;
    this.props.setLinks(initialLinks);
  }

  _onRefresh = () => {
    getUrl(LINKS_API_URL)
      .then(newLinks => {
        const links = newLinks.map(link => {
          return {pk: link.id, fields: link}
        });
        this.props.setLinks(links);
      })
  }

  _onUpdate = event => {
    const { payload } = JSON.parse(event);
    switch (payload.action) {
      case 'update':
        return this.props.updateLink(payload);
      case 'create':
        return this.props.createLink(payload);
     case 'delete':
        return this.props.deleteLink(payload);
    }
  }

  render() {
    const { links } = this.props;
    return (
      <div>
        <LinksDetailComponent links={links} onRefresh={this._onRefresh}/>
        <Websocket url={LINKS_WS_URL} onMessage={this._onUpdate}/>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const { links } = state.links;
  return { links };
}

const mapDispatchToProps = {
  setLinks,
  createLink,
  updateLink,
  deleteLink,
}
export default connect(mapStateToProps, mapDispatchToProps)(LinksDetail)
```

## Actualizar test
Como esto es no tan impotante en este paso, esta en otro archivo.
Si queres ver como se actualizaron los tests podes verlo en [Actualización de tests](https://gitlab.com/FedeG/django-react-workshop/blob/step16_add_redux/TESTUPDATE-es.md)


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
Ahora todos los estados estan en Redux.

[Paso 17: A producción](/es/step17_going_to_production)
