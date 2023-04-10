import React from 'react'
import PropTypes from 'prop-types';

import Headline from '../Headline'
import LinkDetail from '../LinkDetail'
import Button from '../Button'

export default class LinksDetail extends React.Component {
  static propTypes = {
    onRefresh: PropTypes.func.isRequired,
    links: PropTypes.arrayOf(
      PropTypes.shape({
        pk: PropTypes.number
      })
    ).isRequired
  }

  render() {
    const { links, onRefresh } = this.props;
    const linksItems = links.map(link => <LinkDetail key={link.pk} link={link} />);
    return (
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <Headline>Links</Headline>
            <Button onClick={onRefresh} label='Refresh'/>
            <div style={{marginTop: 20}}>
              { linksItems }
            </div>
          </div>
        </div>
      </div>
    )
  }
}
