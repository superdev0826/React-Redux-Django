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
