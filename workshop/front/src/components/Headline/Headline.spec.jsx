import React from 'react';
import Headline from './index.jsx';
import { shallow } from 'enzyme';

describe('Headline Component', () => {

  describe('props', () => {

    it('should declare propsTypes', () => {
      expect(Object.keys(Headline.propTypes)).toHaveLength(1);
      expect(Headline.propTypes).toHaveProperty('children');
    })

  })

  describe('render', () => {

    it('should render the component properly', () => {
      const wrapper = shallow(<Headline>Sample App!</Headline>);
      const componentInDOM = '<h1>Sample App!</h1>';
      expect(wrapper.html()).toBe(componentInDOM);
    })

  })

})
