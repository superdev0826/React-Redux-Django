import React from 'react'
import PropTypes from 'prop-types';

export default class LinkDetail extends React.Component {
  static propTypes = {
    link: PropTypes.shape({
      fields: PropTypes.shape({
        url: PropTypes.string,
        name: PropTypes.string,
      })
    }).isRequired
  }

  render() {
    const { link } = this.props;
    return (
      <p>
        {link.fields.name}: <a href={link.fields.url}>{link.fields.url}</a>
      </p>
    )
  }
}
