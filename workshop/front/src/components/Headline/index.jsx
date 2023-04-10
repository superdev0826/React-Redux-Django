import React from 'react';
import PropTypes from 'prop-types';

export default class Headline extends React.Component {
  static propTypes = {
    children: PropTypes.string.isRequired
  }

  render() {
    return (
      <h1>{ this.props.children }</h1>
    )
  }
}
