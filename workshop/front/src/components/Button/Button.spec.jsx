import React from 'react';
import Button from './index.jsx';
import { shallow } from 'enzyme';

describe('Button Component', () => {
  let label, onClick;

  beforeAll(() => {
    label = 'label';
    onClick = () => {};
  })

  describe('props', () => {

    it('should declare propsTypes', () => {
      expect(Object.keys(Button.propTypes)).toHaveLength(2);
      expect(Button.propTypes).toHaveProperty('label');
      expect(Button.propTypes).toHaveProperty('onClick');
    })

  })

  describe('#render', () => {

    it('should render the component properly', () => {
      const wrapper = shallow(<Button label={label} onClick={onClick}/>);
      const componentInDOM = `<button class="btn btn-success" type="button">${label}</button>`;
      expect(wrapper.html()).toBe(componentInDOM);
    })

  })

})
