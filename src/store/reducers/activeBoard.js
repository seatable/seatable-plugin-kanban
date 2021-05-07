import * as actionTypes from '../action-types';

export default function activeBoard(state = {}, action) {
  switch (action.type) {
    case actionTypes.UPDATE_ACTIVE_BOARD: {
      return Object.assign({}, state, action.activeBoard);
    }
    default: {
      return state;
    }
  }
}