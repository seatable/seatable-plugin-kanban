import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { CellType } from 'dtable-utils';
import pluginContext from '../../plugin-context';
import BoardContainer from './board-container';
import BoardSetting from '../board-setting';
import BoardsHelpers from '../../helpers/boards-helper';
import { generateOptionID } from '../../utils/common-utils';
import * as EventTypes from '../../constants/event-types';

import '../../css/board.css';

class Board extends Component {

  constructor(props) {
    super(props);
    const { activeBoard } = props;
    this.state = {
      isShowBoardSetting: !activeBoard.valid,
      focusOnSetting: false
    };
  }

  componentDidMount() {
    this.unsubscribeToggleBoardSetting = this.props.eventBus.subscribe(EventTypes.TOGGLE_BOARD_SETTING, this.onToggleBoardSetting);
    this.unsubscribeCloseBoardSetting = this.props.eventBus.subscribe(EventTypes.CLOSE_BOARD_SETTING, this.onCloseBoardSetting);
  }

  componentDidUpdate(prevProps,prevState) {
    const { activeBoard } = this.props;
    if (prevProps.activeBoard._id !== activeBoard._id) {
      const isShowBoardSetting = !activeBoard.valid;
      this.setState({ isShowBoardSetting });
    }    

    // isShowBoardSetting get involved when id changes
    // use another state to control focus status is more easier to understand
    const { focusOnSetting } = this.state;
    const { focusOnSetting: prevSetting } = prevState;
    
    const closeSettingBtn = document.querySelector('#border-setting-close-btn');
    const toggleSettingBtn = document.querySelector('#border-setting-toggle-btn');
    if(!focusOnSetting && prevSetting) toggleSettingBtn && toggleSettingBtn.focus();
    if(focusOnSetting && !prevSetting) closeSettingBtn && closeSettingBtn.focus();
  }

  componentWillUnmount() {
    this.unsubscribeToggleBoardSetting();
    this.unsubscribeCloseBoardSetting();
  }

  onToggleBoardSetting = () => {
    this.setState({
      isShowBoardSetting: !this.state.isShowBoardSetting,
      focusOnSetting: !this.state.isShowBoardSetting
    });
  };

  onCloseBoardSetting = () => {
    if (this.state.isShowBoardSetting) {
      this.setState({
        isShowBoardSetting: false,
        focusOnSetting: false
      });
    }
  };

  onUpdateBoardSetting = (newBoard) => {
    const { boards, selectedBoardIndex } = this.props;
    let newBoards = BoardsHelpers.updateBoard(boards, { board_index: selectedBoardIndex, new_board: newBoard });
    this.props.updatePluginSettings(newBoards);
  };

  moveList = ({ fromIndex, targetIndex }) => {
    const { activeBoard } = this.props;
    const { lists, selectedTable, groupbyColumn } = activeBoard;
    const fromList = lists[fromIndex];
    const targetList = lists[targetIndex];
    if (!fromList || !targetList || targetList.name === null) return;
    const { type: columnType, name: columnName, data: columnData } = groupbyColumn;
    if (columnType === CellType.SINGLE_SELECT) {
      let updatedOptions = [...((columnData && columnData.options) || [])];
      const fromOptionIndex = updatedOptions.findIndex(option => option.id === fromList.name);
      const targetOptionIndex = updatedOptions.findIndex(option => option.id === targetList.name);
      if (fromOptionIndex < 0 || targetOptionIndex < 0) return;
      const movedOption = updatedOptions.splice(fromOptionIndex, 1)[0];
      updatedOptions.splice(targetOptionIndex, 0, movedOption);
      const newColumnData = Object.assign({}, columnData, { options: updatedOptions });
      window.dtableSDK.modifyColumnData(selectedTable, columnName, newColumnData);
    }
  };

  addNewList = (list) => {
    const { activeBoard } = this.props;
    const { selectedTable, groupbyColumn } = activeBoard;
    const { type: columnType, name: columnName, data: columnData } = groupbyColumn;
    const { listName, payload } = list;
    if (columnType === CellType.SINGLE_SELECT) {
      const oldOptions = (columnData && columnData.options) || [];
      const { optionColor, textColor } = payload;
      const newOptionId = generateOptionID(oldOptions);
      const newOption = { id: newOptionId, name: listName, color: optionColor, textColor };
      const newOptions = [...oldOptions, newOption];
      const newColumnData = Object.assign({}, columnData, { options: newOptions });
      window.dtableSDK.modifyColumnData(selectedTable, columnName, newColumnData);
    }
  };

  onExpandRow = (row) => {
    const { selectedTable } = this.props.activeBoard;
    pluginContext.expandRow(row, selectedTable);
  };

  onAppendRow = (listIndex) => {
    const { activeBoard, dtableValue } = this.props;
    const { collaborators } = dtableValue;
    const { lists, selectedTable, selectedView, groupbyColumn } = activeBoard;
    const targetList = lists[listIndex];
    if (!targetList) return;
    const { type: columnType, data: columnData } = groupbyColumn;
    const { name: listName, cards } = targetList;
    const cardsLen = cards ? cards.length : 0;
    const prevRowId = cardsLen > 0 ? cards[cardsLen - 1].id : '';
    const initData = window.dtableSDK.getInsertedRowInitData(selectedView, selectedTable, prevRowId);
    let cellValue = listName;
    if (columnType === CellType.SINGLE_SELECT) {
      const options = (columnData && columnData.options) || [];
      const option = options.find(option => option.id === listName) || {};
      cellValue = option.name || '';
    } else if (columnType === CellType.COLLABORATOR) {
      const collaborator = collaborators.find(collaborator => listName === collaborator.email);
      cellValue = collaborator ? [collaborator.name] : [];
    }
    const rowData = Object.assign({}, initData, { [groupbyColumn.name]: cellValue });
    const insertedRow = window.dtableSDK.appendRow(selectedTable, rowData, selectedView, { collaborators });
    insertedRow && pluginContext.expandRow(insertedRow, selectedTable);
  };

  onMoveRow = ({ fromListIndex, targetListIndex, fromCardIndex, targetCardIndex }) => {
    const { activeBoard } = this.props;
    const { lists, selectedTable, selectedView, groupbyColumn } = activeBoard;
    const fromList = lists[fromListIndex];
    const targetList = lists[targetListIndex];
    if (!fromList || !targetList) return;
    const { cards: fromListCards } = fromList;
    const { cards: targetListCards } = targetList;
    const movedCard = fromListCards[fromCardIndex];
    const movedRow = movedCard.row;
    const viewRows = window.dtableSDK.getViewRows(selectedView, selectedTable);
    const lastViewRow = viewRows[viewRows.length - 1];
    let movePosition = 'move_below'; let targetRow; let upperRow;
    if (targetCardIndex === 0) {
      movePosition = 'move_above';
      targetRow = targetListCards.length > 0 ? targetListCards[0].row : lastViewRow;
    } else {
      if (fromListIndex === targetListIndex && fromCardIndex < targetCardIndex) {
        targetRow = targetListCards[targetCardIndex].row;
      } else {
        targetRow = targetListCards[targetCardIndex - 1].row;
      }
    }
    if (fromCardIndex === 0) {
      const movedRowIndex = viewRows.find(row => row._id === movedRow._id);
      const upperRowIndex = movedRowIndex - 1;
      upperRow = viewRows[upperRowIndex] || {};
    } else {
      upperRow = fromListCards[fromCardIndex - 1].row;
    }
    const targetIds = [targetRow._id];
    const movedRows = [movedCard.row];
    const upperRowIds = [upperRow._id];
    let updatedRowDataList = {};
    let oldRowDataList = {};
    if (fromListIndex !== targetListIndex) {
      updatedRowDataList = this.getUpdatedRowData(movedRow, groupbyColumn, fromList, targetList);
      if (!updatedRowDataList) {
        return;
      }

      oldRowDataList = this.getOldRowData(movedRow, groupbyColumn);
    }
    window.dtableSDK.moveGroupRows(selectedTable, targetIds, movePosition, movedRows, upperRowIds, updatedRowDataList,
      oldRowDataList, [groupbyColumn]);
  };

  getUpdatedRowData = (movedRow, groupbyColumn, fromList, targetList) => {
    const { key, type } = groupbyColumn;
    const fromName = fromList.name;
    const targetName = targetList.name;
    const movedRowId = movedRow._id;
    const originalCellValue = movedRow[key];
    switch (type) {
      case CellType.COLLABORATOR: {
        if (!targetName) {
          if (fromName) {
            // clear all emails
            return { [movedRowId]: { [key]: null } };
          }
          return null; // not changed under un-categorized list
        }

        // move record(under un-categorized list) to other list
        if (!fromName) {
          return { [movedRowId]: { [key]: [targetName] } };
        }

        // delete from current list
        const deleteIndex = originalCellValue.indexOf(fromName);
        if (deleteIndex < 0) {
          return null;
        }

        let emails = [...originalCellValue];
        emails.splice(deleteIndex, 1);

        // add target email which not exist
        if (!emails.includes(targetName)) {
          emails.push(targetName);
        }
        return { [movedRowId]: { [key]: emails } };
      }
      default: {
        return { [movedRowId]: { [key]: targetName } };
      }
    }
  };

  getOldRowData = (movedRow, groupbyColumn) => {
    const { key } = groupbyColumn;
    const movedRowId = movedRow._id;
    const originalCellValue = movedRow[key];
    return { [movedRowId]: { [key]: originalCellValue } };
  };

  renderBoard = () => {
    const { activeBoard } = this.props;
    const { valid } = activeBoard;
    if (!valid) {
      return (
        <div className="tips-empty-board">{intl.get('There_are_no_lists_yet')}</div>
      );
    }
    return (
      <BoardContainer
        moveList={this.moveList}
        onCardClick={this.onExpandRow}
        onAddCard={this.onAppendRow}
        moveCard={this.onMoveRow}
        addNewList={this.addNewList}
        getViewShownColumns={this.props.getViewShownColumns}
      />
    );
  };

  render() {
    const { boards, selectedBoardIndex } = this.props;
    return (
      <Fragment>
        {this.renderBoard()}
        {this.state.isShowBoardSetting &&
          <BoardSetting
            boardSetting={boards[selectedBoardIndex]}
            onCloseBoardSetting={this.onCloseBoardSetting}
            onUpdateBoardSetting={this.onUpdateBoardSetting}
            getViewShownColumns={this.props.getViewShownColumns}
          />
        }
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  const { boards, dtableValue, activeBoard } = state;
  return {
    boards,
    dtableValue,
    activeBoard,
  };
};

Board.propTypes = {
  selectedBoardIndex: PropTypes.number,
  boards: PropTypes.array,
  dtableValue: PropTypes.object,
  activeBoard: PropTypes.object,
  eventBus: PropTypes.object,
  onBackToHome: PropTypes.func,
  updatePluginSettings: PropTypes.func,
  modifyColumnData: PropTypes.func,
  getViewShownColumns: PropTypes.func,
};

export default connect(mapStateToProps, null)(Board);
