import {
  SET_LINKS,
  UPDATE_LINK,
  DELETE_LINK,
  CREATE_LINK,
} from '../actions/linksActions'
import { getLink } from '../utils/links'

const initState = {
  links: []
}

export default (state = initState, action) => {
  const { links } = state;
  switch (action.type) {
    case SET_LINKS:
      return {
        ...state,
        links: action.links
      };
    case UPDATE_LINK:
      return {
        ...state,
        links: links.map(link => {
          if (link.pk === action.link.pk) {
            return getLink(action.link.pk, action.link.data);
          }
          return link;
        })
      };
    case CREATE_LINK:
      return {
        ...state,
        links: [...links, getLink(action.link.pk, action.link.data)]
      };
    case DELETE_LINK:
      return {
        ...state,
        links: links.filter(link => link.pk !== action.link.pk)
      };
    default:
      return state;
  }
}
