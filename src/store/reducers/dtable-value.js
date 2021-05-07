
import * as actionTypes from '../action-types';

export default function dtableValue(state = {}, action) {
  switch (action.type) {
    case actionTypes.INIT_DTABLE_VALUE: {
      return action.dtableValue;
    }
    default: {
      return state;
    }
  }
}