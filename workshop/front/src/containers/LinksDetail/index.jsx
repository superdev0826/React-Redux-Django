import React from 'react'
import PropTypes from 'prop-types';
import Websocket from 'react-websocket';
import { connect } from 'react-redux'
import { setLinks, createLink, updateLink, deleteLink } from '../../actions/linksActions'

import LinksDetailComponent from '../../components/LinksDetail'
import { LINKS_API_URL, LINKS_WS_URL } from '../../utils/urls'
import { getUrl } from '../../utils/api'


export class LinksDetail extends React.Component {
  static propTypes = {
    links: PropTypes.array.isRequired,
    setLinks: PropTypes.func.isRequired,
    createLink: PropTypes.func.isRequired,
    updateLink: PropTypes.func.isRequired,
    deleteLink: PropTypes.func.isRequired,
    initialLinks: PropTypes.array.isRequired,
  }

  constructor(props) {
    super(props);
    const { initialLinks } = this.props;
    this.props.setLinks(initialLinks);
  }

  _onRefresh = () => {
    getUrl(LINKS_API_URL)
      .then(newLinks => {
        const links = newLinks.map(link => {
          return {pk: link.id, fields: link}
        });
        this.props.setLinks(links);
      })
  }

  _onUpdate = event => {
    const { payload } = JSON.parse(event);
    switch (payload.action) {
      case 'update':
        return this.props.updateLink(payload);
      case 'create':
        return this.props.createLink(payload);
     case 'delete':
        return this.props.deleteLink(payload);
    }
  }

  render() {
    const { links } = this.props;
    return (
      <div>
        <LinksDetailComponent links={links} onRefresh={this._onRefresh}/>
        <Websocket url={LINKS_WS_URL} onMessage={this._onUpdate}/>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const { links } = state.links;
  return { links };
}

const mapDispatchToProps = {
  setLinks,
  createLink,
  updateLink,
  deleteLink,
}
export default connect(mapStateToProps, mapDispatchToProps)(LinksDetail)
