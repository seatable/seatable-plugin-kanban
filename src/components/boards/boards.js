import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import intl from 'react-intl-universal';
import DropdownMenu from '../dropdownmenu';
import ModalPortal from '../dialog/modal-portal';
import RenameBoardDialog from '../dialog/rename-board-dialog';
import NewBoardDialog from '../dialog/new-board-dialog';
import { generatorBoardId, handleEnterKeyDown } from '../../utils/common-utils';
import * as EventTypes from '../../constants/event-types';

const SCROLL_TYPE = {
  PREV: 'prev',
  NEXT: 'next',
};

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
      canScrollPrev: false,
      canScrollNext: false,
      canBoardsScroll: true,
    };
    this.boards = [];
  }
  

  componentDidMount() {
    let { selectedBoardIndex } = this.props;
    let { left } = this.boards[selectedBoardIndex].getBoundingClientRect();
    let { offsetWidth } = this.boardsScroll;
    if (left > offsetWidth) {
      this.boardsScroll.scrollLeft = left - offsetWidth;
    } else {
      this.checkAvailableScrollType();
    }
    document.addEventListener('click', this.onHideBoardDropdown);
    this.unsubscribeScrollToRightEnd = this.props.eventBus.subscribe(EventTypes.BOARDS_SCROLL_TO_RIGHT_END, this.scrollToRightEnd);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onHideBoardDropdown);
    this.unsubscribeScrollToRightEnd();
  }

  componentDidUpdate() {
    if(this.handleArrowKeyDown) {
      document.removeEventListener('keydown', this.handleArrowKeyDown);
    }

    const btns = document.querySelectorAll('.dropdown-item-btn');
    const dropDownBtn = document.querySelector('.btn-view-dropdown');
    if(!btns.length) return;
    let currentIdx = -1;
    this.handleArrowKeyDown = (e) => {
      if (e.key === 'ArrowUp') {
        currentIdx--;
        if (currentIdx < 0) {
          dropDownBtn.focus();
          currentIdx = -1;
        } else {
          btns[currentIdx].focus();
        }
      } else if (e.key === 'ArrowDown') {
        currentIdx++;
        if (currentIdx >= btns.length) {
          dropDownBtn.focus();
          currentIdx = -1;
        } else {
          btns[currentIdx].focus();
        }
      }
    };
    document.addEventListener('keydown', this.handleArrowKeyDown);
  }


  checkAvailableScrollType = () => {
    const { canScrollPrev, canScrollNext } = this.state;
    let { offsetWidth, scrollWidth, scrollLeft } = this.boardsScroll;
    let _canScrollPrev = false;
    let _canScrollNext = false;
    if (scrollLeft > 0) {
      _canScrollPrev = true;
    }
    if (scrollLeft + offsetWidth < scrollWidth) {
      _canScrollNext = true;
    }

    if (_canScrollPrev !== canScrollPrev || _canScrollNext !== canScrollNext) {
      this.setState({
        canScrollPrev: _canScrollPrev,
        canScrollNext: _canScrollNext,
      });
    }
  };

  onScrollWithControl = (type) => {
    const { offsetWidth, scrollWidth, scrollLeft } = this.boardsScroll;
    let targetScrollLeft;
    if (type === SCROLL_TYPE.PREV) {
      if (scrollLeft === 0) {
        return;
      }
      targetScrollLeft = scrollLeft - offsetWidth;
      targetScrollLeft = targetScrollLeft > 0 ? targetScrollLeft : 0;
    }

    if (type === SCROLL_TYPE.NEXT) {
      if (scrollLeft + offsetWidth === scrollWidth) {
        return;
      }
      targetScrollLeft = scrollLeft + offsetWidth;
      targetScrollLeft = targetScrollLeft > scrollWidth - offsetWidth ? scrollWidth - offsetWidth : targetScrollLeft;
    }
    if (this.state.canBoardsScroll) {
      this.setState({ canBoardsScroll: false });
      let timer = null;
      timer = setInterval(() => {
        let step = (targetScrollLeft - scrollLeft) / 10;
        step = step > 0 ? Math.ceil(step) : Math.floor(step);
        this.boardsScroll.scrollLeft = this.boardsScroll.scrollLeft + step;
        if (Math.abs(targetScrollLeft - this.boardsScroll.scrollLeft) <= Math.abs(step)) {
          this.boardsScroll.scrollLeft = targetScrollLeft;
          clearInterval(timer);
          this.setState({ canBoardsScroll: true });
        }
      }, 15);
    }
  };

  onBoardsScroll = () => {
    this.checkAvailableScrollType();
  };

  setBoardItem = idx => boardItem => {
    this.boards[idx] = boardItem;
  };

  scrollToRightEnd = () => {
    if (!this.boardsScroll) return;
    let { offsetWidth, scrollWidth } = this.boardsScroll;
    if (scrollWidth > offsetWidth) {
      this.boardsScroll.scrollLeft = scrollWidth - offsetWidth;
    }
  };

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
  };

  onHideBoardDropdown = () => {
    if (this.state.isShowBoardDropdown) {
      this.setState({ isShowBoardDropdown: false });
    }
  };

  onToggleRenameBoard = () => {
    this.setState({ isShowRenameBoardDialog: !this.state.isShowRenameBoardDialog });
  };

  hideRenameBoardDialog = () => {
    this.setState({ isShowRenameBoardDialog: false });
  };

  onNewBoardToggle = () => {
    this.setState({ isShowNewBoardDialog: !this.state.isShowNewBoardDialog });
  };

  onHideNewBoardDialog = () => {
    this.setState({ isShowNewBoardDialog: false });
  };

  onAppendBoard = (name) => {
    const { boards } = this.props;
    const newBoard = {
      _id: generatorBoardId(boards),
      name,
    };
    this.props.onAppendBoard(newBoard);
  };

  onSelectBoard = (index) => {
    this.props.onSelectBoard(index);
  };

  render() {
    const { boards, selectedBoardIndex } = this.props;
    let {
      isShowBoardDropdown, dropdownMenuPosition, isShowNewBoardDialog, isShowRenameBoardDialog,
      canScrollPrev, canScrollNext,
    } = this.state;
    let selectedBoard = boards[selectedBoardIndex] || {};
    return (
      <div className="plugin-kanban-boards">
        <div
          className="boards-scroll"
          ref={ref => this.boardsScroll = ref}
          onScroll={this.onBoardsScroll}
        >
          <div className="boards d-inline-flex">
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
                    <div 
                      className="boards-item-name"
                      tabIndex={0}
                      aria-label={name}
                      onKeyDown={handleEnterKeyDown(this.onSelectBoard.bind(this, i))}
                    >
                      {name}
                    </div>
                    {isActiveBoard &&
                      <div
                        className="btn-boards-item-dropdown btn-view-dropdown"
                        ref={ref => this.btnBoardDropdown = ref}
                        onClick={this.onDropdownToggle}
                        tabIndex={0}
                        aria-label={intl.get('Dropdown_options')}
                        onKeyDown={handleEnterKeyDown(this.onDropdownToggle)}
                      >
                        <i className="dtable-font dtable-icon-drop-down"></i>
                        {isShowBoardDropdown &&
                          <ModalPortal>
                            <DropdownMenu
                              dropdownMenuPosition={dropdownMenuPosition}
                              options={
                                <Fragment>
                                  <button 
                                    className="dropdown-item dropdown-item-btn" 
                                    onClick={this.onToggleRenameBoard}
                                    onKeyDown={handleEnterKeyDown(this.onToggleRenameBoard)}
                                  >
                                    <i className="item-icon dtable-font dtable-icon-rename"></i>
                                    <span className="item-text">{intl.get('Rename_board')}</span>
                                  </button>
                                  {boards.length > 1 &&
                                    <button 
                                      className="dropdown-item dropdown-item-btn" 
                                      onClick={this.props.onDeleteBoard.bind(this, i)}
                                      onKeyDown={handleEnterKeyDown(this.props.onDeleteBoard.bind(this, i))}
                                    >
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
        {(canScrollPrev || canScrollNext) &&
          <div className="boards-scroll-control">
            <span
              className={classnames('scroll-control-btn', 'scroll-prev', { 'scroll-active': canScrollPrev })}
              onClick={this.onScrollWithControl.bind(this, SCROLL_TYPE.PREV)}
            >
              <i className="dtable-font dtable-icon-left-slide btn-scroll-icon" />
            </span>
            <span
              className={classnames('scroll-control-btn', 'scroll-next', { 'scroll-active': canScrollNext })}
              onClick={this.onScrollWithControl.bind(this, SCROLL_TYPE.NEXT)}
            >
              <i className="dtable-font dtable-icon-right-slide btn-scroll-icon" />
            </span>
          </div>
        }
        <div className="btn-add-board"
          onClick={this.onNewBoardToggle}>
          <i 
            className="dtable-font dtable-icon-add-table"
            aria-label={intl.get('Add_view')}
            tabIndex={0}
            onKeyDown={handleEnterKeyDown(this.onNewBoardToggle)}
          >
          </i>
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
  eventBus: PropTypes.object,
  onSelectBoard: PropTypes.func,
  onRenameBoard: PropTypes.func,
  onAppendBoard: PropTypes.func,
  onDeleteBoard: PropTypes.func,
};

export default connect(mapStateToProps, null)(Boards);
