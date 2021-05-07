import * as actionTypes from '../action-types';

export default function boards(state = [], action) {
  switch (action.type) {
    case actionTypes.UPDATE_BOARDS: {
      return action.boards;
    }
    default: {
      return state;
    }
  }
}