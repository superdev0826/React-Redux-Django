export const SET_LINKS = 'SET_LINKS';
export const UPDATE_LINK = 'UPDATE_LINK';
export const DELETE_LINK = 'DELETE_LINK';
export const CREATE_LINK = 'CREATE_LINK';

export function setLinks(links){
  return {
    type: SET_LINKS,
    links
  }
}

export function updateLink(link){
  return {
    type: UPDATE_LINK,
    link
  }
}

export function deleteLink(link){
  return {
    type: DELETE_LINK,
    link
  }
}

export function createLink(link){
  return {
    type: CREATE_LINK,
    link
  }
}

const linksActions = {
  setLinks,
  createLink,
  updateLink,
  deleteLink,
  DELETE_LINK,
  CREATE_LINK,
  UPDATE_LINK,
  SET_LINKS
}
export default linksActions
