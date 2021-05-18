import React from 'react';
import PropTypes from 'prop-types';
import DTable from 'dtable-sdk';
import { Provider } from 'react-redux';
import intl from 'react-intl-universal';
import store from './store';
import EventBus from './utils/event-bus';
import { getDtableUuid } from './utils';
import { PLUGIN_NAME } from './constants';
import Kanban from './kanban';
import List from './model/list';
import Card from './model/card';
import * as actionTypes from './store/action-types';

import './locale';

import './css/app.css';

/**
 * boards: [
 *   {_id, name, table_name, view_name, groupby_column_name}
 * ]
 */
const DEFAULT_PLUGIN_SETTINGS = {
  boards: [
    {_id: '0000', name: intl.get('Default_board')}
  ]
};

const KEY_SELECTED_BOARD_IDS = `${PLUGIN_NAME}-selectedBoardIds`;

const propTypes = {
  showDialog: PropTypes.bool
};

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      showDialog: props.showDialog || false,
      selectedBoardIndex: 0,
    };
    this.eventBus = new EventBus();
    this.dtable = new DTable();
  }

  componentDidMount() {
    this.initPluginDTableData();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({showDialog: nextProps.showDialog});
  }

  componentWillUnmount() {
    this.unsubscribeLocalDtableChanged();
    this.unsubscribeRemoteDtableChanged();
  }

  async initPluginDTableData() {
    if (window.app === undefined) {
      // local develop
      window.app = {};
      window.app.state = {};
      await this.dtable.init(window.dtablePluginConfig);
      await this.dtable.syncWithServer();
      const relatedUsersRes = await this.getRelatedUsersFromServer(this.dtable.dtableStore);
      const userList = relatedUsersRes.data.user_list;
      window.app.collaborators = userList;
      window.app.state.collaborators = userList;
      this.dtable.subscribe('dtable-connect', () => { this.onDTableConnect(); });
    } else {
      // integrated to dtable app
      this.dtable.initInBrowser(window.app.dtableStore);
    }
    this.unsubscribeLocalDtableChanged = this.dtable.subscribe('local-dtable-changed', () => { this.onDTableChanged(); });
    this.unsubscribeRemoteDtableChanged = this.dtable.subscribe('remote-dtable-changed', () => { this.onDTableChanged(); });
    this.resetData();
  }

  async getRelatedUsersFromServer(dtableStore) {
    return dtableStore.dtableAPI.getTableRelatedUsers();
  }

  onDTableConnect = () => {
    this.resetData();
  }

  onDTableChanged = () => {
    this.resetData();
  }

  resetData = () => {
    let plugin_settings = this.dtable.getPluginSettings(PLUGIN_NAME) || {};
    if (!plugin_settings || Object.keys(plugin_settings).length === 0) {
      plugin_settings = DEFAULT_PLUGIN_SETTINGS;
    }
    const dtableUuid = getDtableUuid();
    const { boards } = plugin_settings;
    const selectedBoardIndex = this.getSelectedBoardIndexByLocalStorage(boards, dtableUuid);
    this.collaborators = this.getRelatedUsersFromLocal();
    this.cellType = this.dtable.getCellType();
    this.columnIconConfig = this.dtable.getColumnIconConfig();
    this.tables = this.dtable.getTables();
    this.supportGroupbyColumnTypes = [this.cellType.SINGLE_SELECT, this.cellType.COLLABORATOR];
    this.optionColors = this.dtable.getOptionColors();

    store.dispatch({ type: actionTypes.UPDATE_BOARDS, boards });
    this.initDtableValue();
    if (selectedBoardIndex > -1) {
      const boardSetting = boards[selectedBoardIndex] || {};
      const activeBoard = this.getActiveBoard(boardSetting, this.tables);
      store.dispatch({ type: actionTypes.UPDATE_ACTIVE_BOARD, activeBoard });
    }
    this.setState({
      isLoading: false,
      selectedBoardIndex,
    });
  }

  getSelectedBoardIndexByLocalStorage = (boards, dtableUuid) => {
    const selectedBoardIds = this.getSelectedBoardIds();
    if (!selectedBoardIds) {
      return 0;
    }
    const selectedBoardId = selectedBoardIds[dtableUuid];
    if (!selectedBoardId) {
      return 0;
    }
    const selectedBoardIndex = boards.findIndex(board => board._id === selectedBoardId);
    return selectedBoardIndex > 0 ? selectedBoardIndex : 0;
  }

  getTableFormulaRows = (table, view) => {
    let rows = this.dtable.getViewRows(view, table);
    return this.dtable.getTableFormulaResults(table, rows);
  }

  getActiveBoard = (boardSetting, tables) => {
    const { _id, name, table_name, view_name, groupby_column_name, columns: configuredColumns } = boardSetting;
    const selectedTable = (table_name && this.dtable.getTableByName(table_name)) || tables[0];
    const selectedView = (view_name && this.dtable.getViewByName(selectedTable, view_name)) || selectedTable.views[0];
    const groupbyColumn = groupby_column_name && this.dtable.getColumnByName(selectedTable, groupby_column_name);
    const { key: groupbyColumnKey, type: groupbyColumnType } = groupbyColumn || {};
    let lists = [], canAddList = false, draggable = false, valid = false;
    if (!selectedTable || !selectedView || !groupbyColumn ||
      this.supportGroupbyColumnTypes.indexOf(groupbyColumnType) < 0
    ){
      return { _id, name, lists, selectedTable, selectedView, groupbyColumn, canAddList, draggable, valid };
    } else {
      valid = true;
    }
    lists = this.getLists(groupbyColumn);
    this.sortLists(lists, groupbyColumn);
    this.dtable.forEachRow(selectedTable.name, selectedView.name, (row) => {
      const originRow = this.dtable.getRowById(selectedTable, row._id);
      let listIndex;
      switch (groupbyColumn.type) {
        case this.cellType.SINGLE_SELECT: {
          canAddList = true;
          draggable = true;
          const listName = originRow[groupbyColumnKey] || null;
          listIndex = lists.findIndex((list) => list.name === listName);
          this.updateLists(lists, listIndex, originRow, row);
          break;
        }
        case this.cellType.COLLABORATOR: {
          const cellValue = row[groupby_column_name];
          if (Array.isArray(cellValue)) {
            cellValue.forEach((email) => {
              const listName = email || null;
              listIndex = lists.findIndex((list) => list.name === listName);
              this.updateLists(lists, listIndex, originRow);
            });
          } else {
            listIndex = lists.findIndex((list) => list.name === null);
            this.updateLists(lists, listIndex, originRow);
          }
          break;
        }
        default: break;
      }
    });
    if (lists.length > 0 && lists[0].name === null && lists[0].cards.length === 0) {
      lists.splice(0, 1);
    }
    let formulaRows = this.getTableFormulaRows(selectedTable, selectedView);
    return { _id, name, lists, selectedTable, selectedView, formulaRows, groupbyColumn, configuredColumns, canAddList, draggable, valid };
  }

  getLists = (groupbyColumn) => {
    const { type: groupbyColumnType, data: groupbyColumnData } = groupbyColumn;
    let lists = [];
    switch (groupbyColumnType) {
      case this.cellType.SINGLE_SELECT: {
        const options = (groupbyColumnData && groupbyColumnData.options) || [];
        lists = Array.isArray(options) && options.map(option => {
          const optionId = option.id;
          return new List({name: optionId, cards: []});
        });
        break;
      }
      case this.cellType.COLLABORATOR: {
        lists = Array.isArray(this.collaborators) && this.collaborators.map(collaborator => {
          const email = collaborator.email;
          return new List({name: email, cards: []});
        });
        break;
      }
      default: {
        lists = [];
      }
    }
    if (lists.length > 0) {
      lists.unshift({name: null, cards: []});
    }
    return lists;
  }

  updateLists(lists, listIndex, originRow) {
    if (listIndex < 0) return;
    const card = new Card({
      id: originRow._id,
      row: originRow
    });
    lists[listIndex].cards.push(card);
  }

  sortLists = (lists, groupbyColumn) => {
    const { type: columnType, data: columnData } = groupbyColumn;
    if (columnType === this.cellType.COLLABORATOR) {
      return lists;
    }
    let optionIds = [];
    if (columnType === this.cellType.SINGLE_SELECT) {
      const columnOptions = (columnData && columnData.options) || [];
      optionIds = columnOptions.map((option) => option.id);
    }
    lists.sort((currentList, nextList) => {
      const { name: currentListName } = currentList;
      const { name: nextListName } = nextList;
      if (!currentListName && currentListName !== 0) {
        return -1;
      }
      if (!nextListName && nextListName !== 0) {
        return 1;
      }
      switch (columnType) {
        case this.cellType.SINGLE_SELECT: {
          if (!Array.isArray(optionIds) || optionIds.length === 0) {
            return 0;
          }
          if (optionIds.indexOf(currentListName) === -1) {
            return 1;
          }
          if (optionIds.indexOf(nextListName) === -1) {
            return -1;
          }
          if (optionIds.indexOf(currentListName) > optionIds.indexOf(nextListName)) {
            return 1;
          } else if (optionIds.indexOf(currentListName) < optionIds.indexOf(nextListName)) {
            return -1;
          }
          return 0;
        }
        default: return 0;
      }
    });
  }

  initDtableValue = () => {
    const dtableValue = {
      dtable: this.dtable,
      tables: this.tables,
      cellType: this.cellType,
      columnIconConfig: this.columnIconConfig,
      collaborators: this.collaborators,
      supportGroupbyColumnTypes: this.supportGroupbyColumnTypes,
      optionColors: this.optionColors,
    };
    store.dispatch({
      type: 'INIT_DTABLE_VALUE',
      dtableValue
    });
  }

  storeSelectedViewId = (boardId) => {
    let dtableUuid = getDtableUuid();
    let selectedBoardIds = this.getSelectedBoardIds();
    selectedBoardIds[dtableUuid] = boardId;
    window.localStorage.setItem(KEY_SELECTED_BOARD_IDS, JSON.stringify(selectedBoardIds));
  }

  getSelectedBoardIds = () => {
    let selectedBoardIds = window.localStorage.getItem(KEY_SELECTED_BOARD_IDS);
    return selectedBoardIds ? JSON.parse(selectedBoardIds) : {};
  }

  onPluginToggle = () => {
    setTimeout(() => {
      this.setState({showDialog: false});
    }, 500);
    window.app.onClosePlugin && window.app.onClosePlugin();
  }

  getRelatedUsersFromLocal = () => {
    let { collaborators, state } = window.app;
    if (!collaborators) {
      // dtable app
      return state && state.collaborators;
    }
    return collaborators; // local develop
  }

  onSelectBoard = (selectedBoardIndex, callback = null) => {
    const { boards = [], dtableValue } = store.getState();
    this.setState({ selectedBoardIndex }, () => {
      const boardSetting = boards[selectedBoardIndex];
      if (boardSetting) {
        store.dispatch({
          type: 'UPDATE_ACTIVE_BOARD',
          activeBoard: this.getActiveBoard(boardSetting, dtableValue.tables)
        });
        this.storeSelectedViewId(boardSetting._id);
        callback && callback();
      }
    });
  }

  updatePluginSettings = (boards) => {
    this.dtable.updatePluginSettings(PLUGIN_NAME, { boards });
  }

  render() {
    let { isLoading, showDialog } = this.state;
    if (isLoading || !showDialog) {
      return '';
    }
    return (
      <Provider store={store}>
        <Kanban
          selectedBoardIndex={this.state.selectedBoardIndex}
          eventBus={this.eventBus}
          onSelectBoard={this.onSelectBoard}
          updatePluginSettings={this.updatePluginSettings}
          storeSelectedViewId={this.storeSelectedViewId}
        />
      </Provider>
    );
  }
}

App.propTypes = propTypes;

export default App;
