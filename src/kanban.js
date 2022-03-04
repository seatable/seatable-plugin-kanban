import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import Boards from './components/boards/boards';
import Board from './components/board/board';
import BoardsHelpers from './helpers/boards-helper';
import * as EventTypes from './constants/event-types';

import kanbanLogo from './assets/image/kanban.png';

class Kanban extends Component {

  onPluginToggle = () => {
    setTimeout(() => {
      this.setState({showDialog: false});
    }, 500);
    window.app.onClosePlugin && window.app.onClosePlugin();
  }

  onToggleBoardSetting = () => {
    this.props.eventBus.dispatch(EventTypes.TOGGLE_BOARD_SETTING);
  }

  onRenameBoard = (newName) => {
    const { boards, selectedBoardIndex } = this.props;
    const newBoards = BoardsHelpers.renameBoard(boards, {board_index: selectedBoardIndex, new_name: newName});
    this.props.updatePluginSettings(newBoards);
  }

  onAppendBoard = (newBoard) => {
    const { boards } = this.props;
    const boardsLen = boards.length;
    const insertIndex = boardsLen + 1;
    const newBoards = BoardsHelpers.insertBoard(boards, {board_index: insertIndex, new_board: newBoard});
    this.props.updatePluginSettings(newBoards);
    this.props.onSelectBoard(boardsLen, () => {
      const newSelectedBoard = newBoards[boardsLen] || {};
      this.props.storeSelectedViewId(newSelectedBoard._id);
      this.props.eventBus.dispatch(EventTypes.BOARDS_SCROLL_TO_RIGHT_END);
    });
  }

  onDeleteBoard = (index) => {
    const { boards } = this.props;
    const newBoards = BoardsHelpers.deleteBoard(boards, {board_index: index});
    const newSelectedBoardIndex = index > 0 ? index - 1 : 0;
    this.props.updatePluginSettings(newBoards);
    this.props.onSelectBoard(newSelectedBoardIndex);
    const newSelectedBoard = newBoards[newSelectedBoardIndex] || {};
    this.props.storeSelectedViewId(newSelectedBoard._id);
  }

  render() {
    const { selectedBoardIndex, eventBus } = this.props;
    return (
      <div className="dtable-plugin plugin-kanban">
        <div className="plugin-header">
          <div className="plugin-header-container">
            <div className="plugin-logo">
              <img className="plugin-logo-icon" src={kanbanLogo} alt="kanban" />
              <span>{intl.get('Kanban')}</span>
            </div>
            <Boards
              selectedBoardIndex={selectedBoardIndex}
              onSelectBoard={this.props.onSelectBoard}
              eventBus={eventBus}
              onRenameBoard={this.onRenameBoard}
              onAppendBoard={this.onAppendBoard}
              onDeleteBoard={this.onDeleteBoard}
            />
            <div className="kanban-operators">
              {selectedBoardIndex > -1 && <span className="kanban-operator dtable-font dtable-icon-settings btn-settings" onClick={this.onToggleBoardSetting}></span>}
              <span className="kanban-operator dtable-font dtable-icon-x btn-close" onClick={this.onPluginToggle}></span>
            </div>
          </div>
        </div>
        <div className="plugin-body">
          <div className="kanban o-hidden">
            {selectedBoardIndex > -1 &&
              <Board
                selectedBoardIndex={selectedBoardIndex}
                eventBus={eventBus}
                updatePluginSettings={this.props.updatePluginSettings}
                getNonArchiveViews={this.props.getNonArchiveViews}
                getViewShownColumns={this.props.getViewShownColumns}
              />
            }
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    boards: state.boards,
    dtableValue: state.dtableValue,
  };
};

Kanban.propTypes = {
  eventBus: PropTypes.object,
  updatePluginSettings: PropTypes.func,
  storeSelectedViewId: PropTypes.func,
  getNonArchiveViews: PropTypes.func,
  getViewShownColumns: PropTypes.func,
};

export default connect(mapStateToProps, null)(Kanban);
