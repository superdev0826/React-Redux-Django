# Actualizar tests para las nuevas funcionalidades

## Actualizar carpetas de coverage
En **workshop/front/package.json**:
```diff
     "collectCoverageFrom": [
       "src/components/**/*.{js,jsx}",
-      "src/containers/**/*.{js,jsx}"
+      "src/containers/**/*.{js,jsx}",
+      "src/utils/**/*.js",
+      "src/actions/**/*.js",
+      "src/reducers/**/*.js",
+      "src/store/**/*.js"
     ]
```

## Actualizar tests para el contenedor de LinksDetail
Replazamos el archivo **workshop/front/src/containers/LinksDetail/LinksDetail.spec.jsx** con:
```javascript
import React from 'react';
import { LinksDetail } from './index.jsx';
import { shallow } from 'enzyme';

describe('LinksDetail Component', () => {
  let links, link, LinksDetailContainerWrapper, LinksDetailContainer,
   setLinks, createLink, updateLink, deleteLink, initialLinks;

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
    links = [link]
  })

  beforeEach(() => {
    setLinks = jest.fn();
    createLink = jest.fn();
    updateLink = jest.fn();
    deleteLink = jest.fn();
    initialLinks = [];
    LinksDetailContainerWrapper = shallow(
      <LinksDetail
        links={links}
        setLinks={setLinks}
        createLink={createLink}
        updateLink={updateLink}
        deleteLink={deleteLink}
        initialLinks={initialLinks}
      />
    );
  })

  describe('props', () => {

    it('should declare propsTypes', () => {
      expect(Object.keys(LinksDetail.propTypes)).toHaveLength(6);
      expect(LinksDetail.propTypes).toHaveProperty('links');
      expect(LinksDetail.propTypes).toHaveProperty('setLinks');
      expect(LinksDetail.propTypes).toHaveProperty('createLink');
      expect(LinksDetail.propTypes).toHaveProperty('updateLink');
      expect(LinksDetail.propTypes).toHaveProperty('deleteLink');
      expect(LinksDetail.propTypes).toHaveProperty('initialLinks');
    })

  })

  describe('#render', () => {

    it('should render the component properly', () => {
      const itemInDOM = `<p>${link.fields.name}: <a href="${link.fields.url}">${link.fields.url}</a></p>`;
      const button = '<button class="btn btn-success" type="button">Refresh</button>';
      const componentInDOM = `<div><div class="container"><div class="row"><div class="col-sm-12"><h1>Links</h1>${button}<div style="margin-top:20px">${itemInDOM}</div></div></div></div><div></div></div>`;
      expect(LinksDetailContainerWrapper.html()).toBe(componentInDOM);
    })

  })

  describe('state', () => {
    let linkEvent, linkUpdate, linkCreate, linkDelete;

    beforeAll(() => {
      linkEvent = {
        stream: 'links',
        payload: {
          action: 'update',
          pk: 1,
          data: {
            name: 'Extra fields on many to many',
            url: 'https://docs.djangoproject.com/en/1.11/topics/db/models/#extra-fields-on-many-to-many-relationships',
            pending: false,
            description: '',
            user: 1
          },
          model: 'links.link'
        }
      };
      linkUpdate = JSON.parse(JSON.stringify(linkEvent));
      linkCreate = JSON.parse(JSON.stringify(linkEvent));
      linkCreate.payload.action = 'create';
      linkDelete = JSON.parse(JSON.stringify(linkEvent));
      linkDelete.payload.action = 'delete';
    })

    beforeEach(() => {
      LinksDetailContainer = LinksDetailContainerWrapper.instance();
    })

    it('should call setLinks in construnctor', () => {
      expect(setLinks).toBeCalled();
      expect(setLinks).toBeCalledWith(initialLinks);
    })

    it('when send link update event onUpdate should call updateLink', () => {
      LinksDetailContainer._onUpdate(JSON.stringify(linkUpdate));
      expect(updateLink).toBeCalled();
      expect(updateLink).toBeCalledWith(linkUpdate.payload);
    })

    it('when send link create event onUpdate should call createLink', () => {
      LinksDetailContainer._onUpdate(JSON.stringify(linkCreate));
      expect(createLink).toBeCalled();
      expect(createLink).toBeCalledWith(linkCreate.payload);
    })

    it('when send link delete event onUpdate should call deleteLink', () => {
      LinksDetailContainer._onUpdate(JSON.stringify(linkDelete));
      expect(deleteLink).toBeCalled();
      expect(deleteLink).toBeCalledWith(linkDelete.payload);
    })

  })


})
```

## Creamos tests para Redux:

En **workshop/front/src/actions/linksActions.spec.js**:
```javascript
import {
  setLinks, createLink, updateLink, deleteLink,
  DELETE_LINK, CREATE_LINK, UPDATE_LINK, SET_LINKS
} from './linksActions'

describe('links Actions', () => {
  let link, links, expectDefault;

  beforeEach(() => {
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
    links = [link]
  });

  describe(SET_LINKS, () => {

    beforeEach(() => {
      expectDefault = {
        type: SET_LINKS,
        links
      }
    })

    test('returns a object', () => {
      const result = setLinks(links)
      expect(result).toBeDefined()
    })

    test('returns correct links', () => {
      const result = setLinks(links)
      expect(result).toEqual(expectDefault)
    })

  })

  describe(UPDATE_LINK, () => {

    beforeEach(() => {
      expectDefault = {
        type: UPDATE_LINK,
        link
      }
    })

    test('returns a object', () => {
      const result = updateLink(link)
      expect(result).toBeDefined()
    })

    test('returns correct links', () => {
      const result = updateLink(link)
      expect(result).toEqual(expectDefault)
    })

  })

  describe(CREATE_LINK, () => {

    beforeEach(() => {
      expectDefault = {
        type: CREATE_LINK,
        link
      }
    })

    test('returns a object', () => {
      const result = createLink(link)
      expect(result).toBeDefined()
    })

    test('returns correct links', () => {
      const result = createLink(link)
      expect(result).toEqual(expectDefault)
    })

  })

  describe(DELETE_LINK, () => {

    beforeEach(() => {
      expectDefault = {
        type: DELETE_LINK,
        link
      }
    })

    test('returns a object', () => {
      const result = deleteLink(link)
      expect(result).toBeDefined()
    })

    test('returns correct links', () => {
      const result = deleteLink(link)
      expect(result).toEqual(expectDefault)
    })

  })

})
```

En **workshop/front/src/reducers/links.spec.js**:
```javascript
import linksReducer from './links'

const initState = {
  links: []
}

describe('links Reducer', () => {
  let link, links, link2;

  beforeEach(() => {
    link = {
      model: 'links.link',
      pk: 1,
      data: {
        name: 'Gitlab with workshop',
        url: 'https://gitlab.com/FedeG/django-react-workshop/',
        pending: false,
        description: '',
        user: 1
      }
    }
    link2 = {
      model: 'links.link',
      pk: 2,
      data: {
        name: 'Workshop documentation',
        url: 'https://fedeg.gitlab.io/django-react-workshop',
        pending: true,
        description: '',
        user: 1
      }
    }
    links = [link]
  });

  test('when dispatch ANYTHING event returns a state object', () => {
    const result = linksReducer(undefined, {type: 'ANYTHING'});
    expect(result).toBeDefined();
  });

  test('when dispatch INIT event returns default', () => {
    const result = linksReducer(undefined, {type: 'INIT'});
    expect(result).toEqual(initState);
  });

  describe('when dispatch SET_LINKS', () => {

    test('when set links return correct links list', () => {
      const action = {
        type: 'SET_LINKS',
        links
      }
      const result = linksReducer(initState, action);
      expect(result.links).toEqual(links);
    });

  });

  describe('when dispatch UPDATE_LINK', () => {

    test('when update link update original link', () => {
      const action = {
        type: 'UPDATE_LINK',
        link: {
          ...link,
          data: { name: 'new name' },
        }
      }
      const expectedLink = {fields: {name: 'new name'}, pk: 1};
      const result = linksReducer({links}, action);
      expect(result.links).toEqual([expectedLink]);
    });

    test('when update link update only original link', () => {
      const action = {
        type: 'UPDATE_LINK',
        link: {
          ...link,
          data: { name: 'new name' },
        }
      }
      const expectedLink = {fields: {name: 'new name'}, pk: 1};
      const result = linksReducer({links: [link, link2]}, action);
      expect(result.links).toEqual([expectedLink, link2]);
    });

  });

  describe('when dispatch DELETE_LINK', () => {

    test('when delete link return empty links list', () => {
      const action = {
        type: 'DELETE_LINK',
        link
      }
      const result = linksReducer({links}, action);
      expect(result.links).toEqual([]);
    });

  });

  describe('when dispatch CREATE_LINK', () => {

    test('when create link return correct links list', () => {
      const action = {
        type: 'CREATE_LINK',
        link
      }
      const createdLink = {
       fields: {
          description: '',
          name: 'Gitlab with workshop',
          pending: false,
          url: 'https://gitlab.com/FedeG/django-react-workshop/',
          user: 1,
        },
        pk: 1,
      }
      const result = linksReducer({links}, action);
      expect(result.links).toEqual([link, createdLink]);
    });

  });

})
```

En **workshop/front/src/store/linksStore.spec.js**:
```javascript
const initState = {
  links: {
    links: []
  }
}

describe('Links store', () => {
  let store, link, links;

  beforeEach(() => {
    const get_store = require('./linksStore').default
    store = get_store()
    link = {
      model: 'links.link',
      pk: 1,
      data: {
        name: 'Gitlab with workshop',
        url: 'https://gitlab.com/FedeG/django-react-workshop/',
        pending: false,
        description: '',
        user: 1
      }
    }
    links = [link]
  });

  test('returns a state object', () => {
    const result = store.getState();
    expect(result).toBeDefined();
  });

  test('returns default', () => {
    const result = store.getState();
    expect(result).toEqual(initState);
  });

  describe('links reducers', () => {

    test('when dispatch SET_LINKS returns correct state', () => {
      const expectData = {links};
      store.dispatch({type: 'SET_LINKS', links});
      expect(store.getState().links).toEqual(expectData);
    });

    test('when dispatch UPDATE_LINK returns correct state', () => {
      const expectedLink = {fields: {name: 'new name'}, pk: 1};
      const expectData = {links: [expectedLink]};
      store.dispatch({type: 'SET_LINKS', links});
      store.dispatch({type: 'UPDATE_LINK', link: {
        ...link,
        data: { name: 'new name' },
      }});
      expect(store.getState().links).toEqual(expectData);
    });

    test('when dispatch DELETE_LINK returns correct state', () => {
      const expectData = {links: []};
      store.dispatch({type: 'SET_LINKS', links});
      store.dispatch({type: 'DELETE_LINK', link});
      expect(store.getState().links).toEqual(expectData);
    });

    test('when dispatch CREATE_LINK returns correct state', () => {
      const createdLink = {
       fields: {
          description: '',
          name: 'Gitlab with workshop',
          pending: false,
          url: 'https://gitlab.com/FedeG/django-react-workshop/',
          user: 1,
        },
        pk: 1,
      }
      const expectData = {links: [link, createdLink]};
      store.dispatch({type: 'SET_LINKS', links});
      store.dispatch({type: 'CREATE_LINK', link});
      expect(store.getState().links).toEqual(expectData);
    });

  });

})
```
