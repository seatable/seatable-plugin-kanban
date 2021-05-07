import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import intl from 'react-intl-universal';
import DropdownMenu from '../dropdownmenu';
import ModalPortal from '../dialog/modal-portal';
import RenameBoardDialog from '../dialog/rename-board-dialog';
import NewBoardDialog from '../dialog/new-board-dialog';
import { generatorBoardId } from '../../utils/common-utils';
import * as EventTypes from '../../constants/event-types';

class Boards extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isShowBoardDropdown: false,
      isShowNewBoardDialog: false,
      isShowRenameBoardDialog: false,
      dropdownMenuPosition: {
        top: 0,
        left: 0
      },
    };
    this.boards = [];
  }

  componentDidMount() {
    let { selectedBoardIndex } = this.props;
    let { left } = this.boards[selectedBoardIndex].getBoundingClientRect();
    let { offsetWidth } = this.boardsScroll;
    if (left > offsetWidth) {
      this.boardsScroll.scrollLeft = left - offsetWidth;
    }
    document.addEventListener('click', this.onHideBoardDropdown);
    this.unsubscribeScrollToRightEnd = this.props.eventBus.subscribe(EventTypes.BOARDS_SCROLL_TO_RIGHT_END, this.scrollToRightEnd);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onHideBoardDropdown);
    this.unsubscribeScrollToRightEnd();
  }

  setBoardItem = idx => boardItem => {
    this.boards[idx] = boardItem;
  }

  scrollToRightEnd = () => {
    if (!this.boardsScroll) return;
    let { offsetWidth, scrollWidth } = this.boardsScroll;
    if (scrollWidth > offsetWidth) {
      this.boardsScroll.scrollLeft = scrollWidth - offsetWidth;
    }
  }

  onDropdownToggle = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    evt.nativeEvent.stopImmediatePropagation();
    let { top, left, height } = this.btnBoardDropdown.parentNode.getBoundingClientRect();
    this.setState({
      isShowBoardDropdown: !this.state.isShowBoardDropdown,
      dropdownMenuPosition: {
        top: top + height - 3,
        left
      }
    });
  }

  onHideBoardDropdown = () => {
    if (this.state.isShowBoardDropdown) {
      this.setState({isShowBoardDropdown: false});
    }
  }

  onToggleRenameBoard = () => {
    this.setState({isShowRenameBoardDialog: !this.state.isShowRenameBoardDialog});
  }

  hideRenameBoardDialog = () => {
    this.setState({isShowRenameBoardDialog: false});
  }

  onNewBoardToggle = () => {
    this.setState({isShowNewBoardDialog: !this.state.isShowNewBoardDialog});
  }

  onHideNewBoardDialog = () => {
    this.setState({isShowNewBoardDialog: false});
  }

  onAppendBoard = (name) => {
    const { boards } = this.props;
    const newBoard = {
      _id: generatorBoardId(boards),
      name,
    };
    this.props.onAppendBoard(newBoard);
  }

  onSelectBoard = (index) => {
    this.props.onSelectBoard(index);
  }

  render() {
    const { boards, selectedBoardIndex } = this.props;
    let { isShowBoardDropdown, dropdownMenuPosition, isShowNewBoardDialog, isShowRenameBoardDialog } = this.state;
    let selectedBoard = boards[selectedBoardIndex] || {};
    return (
      <div className="plugin-kanban-boards">
        <div className="boards-scroll" ref={ref => this.boardsScroll = ref}>
          <div className="views d-inline-flex">
            {boards.map((board, i) => {
              let { _id, name } = board;
              let isActiveBoard = selectedBoardIndex === i;
              return (
                <div
                  key={`plugin-kanban-boards-${_id}`}
                  className={classnames({
                    'plugin-kanban-boards-item': true,
                    'active': isActiveBoard
                  })}
                >
                  <div
                    className="boards-item-content"
                    ref={this.setBoardItem(i)}
                    onClick={this.onSelectBoard.bind(this, i)}
                  >
                    <div className="boards-item-name">{name}</div>
                    {isActiveBoard &&
                      <div
                        className="btn-boards-item-dropdown"
                        ref={ref => this.btnBoardDropdown = ref}
                        onClick={this.onDropdownToggle}
                      >
                        <i className="dtable-font dtable-icon-drop-down"></i>
                        {isShowBoardDropdown &&
                          <ModalPortal>
                            <DropdownMenu
                              dropdownMenuPosition={dropdownMenuPosition}
                              options={
                                <Fragment>
                                  <button className="dropdown-item" onClick={this.onToggleRenameBoard}>
                                    <i className="item-icon dtable-font dtable-icon-rename"></i>
                                    <span className="item-text">{intl.get('Rename_board')}</span>
                                  </button>
                                  {boards.length > 1 &&
                                    <button className="dropdown-item" onClick={this.props.onDeleteBoard.bind(this, i)}>
                                      <i className="item-icon dtable-font dtable-icon-delete"></i>
                                      <span className="item-text">{intl.get('Delete_board')}</span>
                                    </button>
                                  }
                                </Fragment>
                              }
                            />
                          </ModalPortal>
                        }
                      </div>
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="btn-add-board" onClick={this.onNewBoardToggle}>
          <i className="dtable-font dtable-icon-add-table"></i>
        </div>
        {isShowNewBoardDialog &&
          <NewBoardDialog
            onNewBoardConfirm={this.onAppendBoard}
            onNewBoardCancel={this.onHideNewBoardDialog}
          />
        }
        {isShowRenameBoardDialog &&
          <RenameBoardDialog
            boardName={selectedBoard.name}
            onRenameBoard={this.props.onRenameBoard}
            hideRenameBoardDialog={this.hideRenameBoardDialog}
          />
        }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    boards: state.boards,
  };
}

Boards.propTypes = {
  boards: PropTypes.array,
  selectedBoardIndex: PropTypes.number,
  onSelectBoard: PropTypes.func,
  onRenameBoard: PropTypes.func,
  onAppendBoard: PropTypes.func,
  onDeleteBoard: PropTypes.func,
};

export default connect(mapStateToProps, null)(Boards);
