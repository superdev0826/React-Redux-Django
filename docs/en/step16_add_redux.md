# Step 16: Add redux

[Back to step 15](/en/step15_websockets_and_channels)

This step is just a bonus, really. You might want to use some other flux implementation to manage your components' state, but Redux is really nice to work with and the de-facto standard at the moment.
The official Redux documentation is much better than anything that I could ever create, so you could read that.
Documentation: https://redux.js.org/

## Install redux

### Install redux dependence
```bash
# with docker
docker exec -it workshopjs yarn add react-redux redux redux-thunk --save
docker exec -it workshopjs yarn add redux-devtools --save-dev

# without docker
cd workshop/front
yarn add react-redux redux redux-thunk --save
yarn add redux-devtools --save-dev
```

## Add Reducers, actions and store
![concepts](https://d2yei5s1by8ykd.cloudfront.net/wp-content/uploads/2017/03/07151912/a962595e-6313-423c-b45f-b7db5b6af1f4_Screenshot202017-03-072013.20.36.png)
Concepts: [glosary](https://redux.js.org/docs/Glossary.html)

### Create actions
In **workshop/front/src/actions/linksActions.js**:
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

### Create reducers
In **workshop/front/src/reducers/index.js**:
```javascript
import { combineReducers } from 'redux'
import links from './links'

export default combineReducers({
  links
})
```

In **workshop/front/src/reducers/links.js**:
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

### Create store
In **workshop/front/src/store/linksStore.js**:
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

### Add a new utils with links functions
In **workshop/front/src/utils/links.js**:
```javascript
export function getLink(pk, fields){
  return {pk, fields}
}
```

## Add Redux Provider
In **workshop/front/src/views/LinksDetail.jsx**:
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

## Connect container to Redux
Replace **workshop/front/src/containers/LinksDetail/index.jsx** file with:
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

## Update test
As this isn't so important in this step is in another file, if you want to see how the tests were updated you can see this in [Update tests](https://gitlab.com/FedeG/django-react-workshop/blob/step16_add_redux/TESTUPDATE.md)

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

[Step 17: Going to Production](/en/step17_going_to_production)
