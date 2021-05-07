import { combineReducers } from 'redux';
import boards from './boards';
import dtableValue from './dtable-value';
import activeBoard from './activeBoard';

export default combineReducers({
  boards,
  dtableValue,
  activeBoard,
});