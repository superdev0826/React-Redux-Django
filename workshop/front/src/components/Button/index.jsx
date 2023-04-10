import React from 'react'
import PropTypes from 'prop-types';

export default class Button extends React.Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired
  }

  _onClick = event => {
    event.preventDefault();
    const { onClick } = this.props;
    onClick();
  }

  render() {
    const { label } = this.props;
    return (
      <button className='btn btn-success' type='button' onClick={this._onClick}>
        { label }
      </button>
    )
  }
}
