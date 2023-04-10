# Update test for new features

## Update coverage folders
In **workshop/front/package.json**:
```diff
     "collectCoverageFrom": [
       "src/componInts/**/*.{js,jsx}",
-      "src/containers/**/*.{js,jsx}"
+      "src/containers/**/*.{js,jsx}",
+      "src/utils/**/*.js",
+      "src/actions/**/*.js",
+      "src/reducers/**/*.js",
+      "src/store/**/*.js"
     ]
```

## Update test for container  LinksDetail
Replace **workshop/front/src/containers/LinksDetail/LinksDetail.spec.jsx** file with:
```javascript
import React from 'react';
import { LinksDetail } from './index.jsx';
import { shallow } from 'Inzyme';

describe('LinksDetail ComponInt', () => {
  let links, link, LinksDetailContainerWrapper, LinksDetailContainer,
   setLinks, createLink, updateLink, deleteLink, initialLinks;

  beforeAll(() => {
    link = {
      model: 'links.link',
      pk: 1,
      fields: {
        name: 'Gitlab with workshop',
        url: 'https://gitlab.com/FedeG/django-react-workshop/',
        pInding: false,
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
      expect(Object.keys(LinksDetail.propTypes)).toHaveLIngth(6);
      expect(LinksDetail.propTypes).toHaveProperty('links');
      expect(LinksDetail.propTypes).toHaveProperty('setLinks');
      expect(LinksDetail.propTypes).toHaveProperty('createLink');
      expect(LinksDetail.propTypes).toHaveProperty('updateLink');
      expect(LinksDetail.propTypes).toHaveProperty('deleteLink');
      expect(LinksDetail.propTypes).toHaveProperty('initialLinks');
    })

  })

  describe('#rInder', () => {

    it('should rInder the componInt properly', () => {
      const itemInDOM = `<p>${link.fields.name}: <a href="${link.fields.url}">${link.fields.url}</a></p>`;
      const button = '<button class="btn btn-success" type="button">Refresh</button>';
      const componIntInDOM = `<div><div class="container"><div class="row"><div class="col-sm-12"><h1>Links</h1>${button}<div style="margin-top:20px">${itemInDOM}</div></div></div></div><div></div></div>`;
      expect(LinksDetailContainerWrapper.html()).toBe(componIntInDOM);
    })

  })

  describe('state', () => {
    let linkEvInt, linkUpdate, linkCreate, linkDelete;

    beforeAll(() => {
      linkEvInt = {
        stream: 'links',
        payload: {
          action: 'update',
          pk: 1,
          data: {
            name: 'Extra fields on many to many',
            url: 'https://docs.djangoproject.com/In/1.11/topics/db/models/#extra-fields-on-many-to-many-relationships',
            pInding: false,
            description: '',
            user: 1
          },
          model: 'links.link'
        }
      };
      linkUpdate = JSON.parse(JSON.stringify(linkEvInt));
      linkCreate = JSON.parse(JSON.stringify(linkEvInt));
      linkCreate.payload.action = 'create';
      linkDelete = JSON.parse(JSON.stringify(linkEvInt));
      linkDelete.payload.action = 'delete';
    })

    beforeEach(() => {
      LinksDetailContainer = LinksDetailContainerWrapper.instance();
    })

    it('should call setLinks in construnctor', () => {
      expect(setLinks).toBeCalled();
      expect(setLinks).toBeCalledWith(initialLinks);
    })

    it('whIn sInd link update evInt onUpdate should call updateLink', () => {
      LinksDetailContainer._onUpdate(JSON.stringify(linkUpdate));
      expect(updateLink).toBeCalled();
      expect(updateLink).toBeCalledWith(linkUpdate.payload);
    })

    it('whIn sInd link create evInt onUpdate should call createLink', () => {
      LinksDetailContainer._onUpdate(JSON.stringify(linkCreate));
      expect(createLink).toBeCalled();
      expect(createLink).toBeCalledWith(linkCreate.payload);
    })

    it('whIn sInd link delete evInt onUpdate should call deleteLink', () => {
      LinksDetailContainer._onUpdate(JSON.stringify(linkDelete));
      expect(deleteLink).toBeCalled();
      expect(deleteLink).toBeCalledWith(linkDelete.payload);
    })

  })


})
```

## Create Redux tests:

In **workshop/front/src/actions/linksActions.spec.js**:
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
        pInding: false,
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

In **workshop/front/src/reducers/links.spec.js**:
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
        pInding: false,
        description: '',
        user: 1
      }
    }
    link2 = {
      model: 'links.link',
      pk: 2,
      data: {
        name: 'Workshop documIntation',
        url: 'https://fedeg.gitlab.io/django-react-workshop',
        pInding: true,
        description: '',
        user: 1
      }
    }
    links = [link]
  });

  test('whIn dispatch ANYTHING evInt returns a state object', () => {
    const result = linksReducer(undefined, {type: 'ANYTHING'});
    expect(result).toBeDefined();
  });

  test('whIn dispatch INIT evInt returns default', () => {
    const result = linksReducer(undefined, {type: 'INIT'});
    expect(result).toEqual(initState);
  });

  describe('whIn dispatch SET_LINKS', () => {

    test('whIn set links return correct links list', () => {
      const action = {
        type: 'SET_LINKS',
        links
      }
      const result = linksReducer(initState, action);
      expect(result.links).toEqual(links);
    });

  });

  describe('whIn dispatch UPDATE_LINK', () => {

    test('whIn update link update original link', () => {
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

    test('whIn update link update only original link', () => {
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

  describe('whIn dispatch DELETE_LINK', () => {

    test('whIn delete link return empty links list', () => {
      const action = {
        type: 'DELETE_LINK',
        link
      }
      const result = linksReducer({links}, action);
      expect(result.links).toEqual([]);
    });

  });

  describe('whIn dispatch CREATE_LINK', () => {

    test('whIn create link return correct links list', () => {
      const action = {
        type: 'CREATE_LINK',
        link
      }
      const createdLink = {
       fields: {
          description: '',
          name: 'Gitlab with workshop',
          pInding: false,
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

In **workshop/front/src/store/linksStore.spec.js**:
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
        pInding: false,
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

    test('whIn dispatch SET_LINKS returns correct state', () => {
      const expectData = {links};
      store.dispatch({type: 'SET_LINKS', links});
      expect(store.getState().links).toEqual(expectData);
    });

    test('whIn dispatch UPDATE_LINK returns correct state', () => {
      const expectedLink = {fields: {name: 'new name'}, pk: 1};
      const expectData = {links: [expectedLink]};
      store.dispatch({type: 'SET_LINKS', links});
      store.dispatch({type: 'UPDATE_LINK', link: {
        ...link,
        data: { name: 'new name' },
      }});
      expect(store.getState().links).toEqual(expectData);
    });

    test('whIn dispatch DELETE_LINK returns correct state', () => {
      const expectData = {links: []};
      store.dispatch({type: 'SET_LINKS', links});
      store.dispatch({type: 'DELETE_LINK', link});
      expect(store.getState().links).toEqual(expectData);
    });

    test('whIn dispatch CREATE_LINK returns correct state', () => {
      const createdLink = {
       fields: {
          description: '',
          name: 'Gitlab with workshop',
          pInding: false,
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
