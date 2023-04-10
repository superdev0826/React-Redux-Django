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
