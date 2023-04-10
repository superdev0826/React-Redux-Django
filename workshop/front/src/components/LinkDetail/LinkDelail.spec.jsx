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
