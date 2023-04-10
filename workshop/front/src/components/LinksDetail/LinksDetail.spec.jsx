import React from 'react';
import LinksDetail from './index.jsx';
import { shallow } from 'enzyme';

describe('LinksDetail Component', () => {
  let links, link;

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

  describe('props', () => {

    it('should declare propsTypes', () => {
      expect(Object.keys(LinksDetail.propTypes)).toHaveLength(2);
      expect(LinksDetail.propTypes).toHaveProperty('links');
      expect(LinksDetail.propTypes).toHaveProperty('onRefresh');
    })

  })

  describe('#render', () => {

    it('should render the component properly', () => {
      const wrapper = shallow(<LinksDetail links={links} onRefresh={() => {}}/>);
      const itemInDOM = `<p>${link.fields.name}: <a href="${link.fields.url}">${link.fields.url}</a></p>`;
      const button = '<button class="btn btn-success" type="button">Refresh</button>';
      const componentInDOM = `<div class="container"><div class="row"><div class="col-sm-12"><h1>Links</h1>${button}<div style="margin-top:20px">${itemInDOM}</div></div></div></div>`;
      expect(wrapper.html()).toBe(componentInDOM);
    })

  })

})
