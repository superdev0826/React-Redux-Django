import React from 'react'
import { render } from 'react-dom'
import LinksDetail from '../containers/LinksDetail'
import {Provider} from 'react-redux'
import linksStore from '../store/linksStore'

const store = linksStore();
window.render_components = properties => {
  window.params = {...properties};
  render(
    (<Provider store={store}>
       <LinksDetail initialLinks={properties.links}/>
    </Provider>), document.getElementById('app'));
};

if (module.hot) {
  if (window.params) window.render_components(window.params);
  module.hot.accept();
}
