import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import Container from '../dnd/container';
import Draggable from '../dnd/draggable';
import List from '../list/list';
import CellFormatter from '../cell-formatter';
import AddList from '../list/list-add';

class BoardContainer extends Component {

  constructor(props) {
    super(props);
    this.unCategorized = intl.get('Uncategorized');
  }

  get groupName() {
    const { _id: boardId } = this.props.activeBoard || {};
    return `plugin_kanban_board_${boardId}`;
  }

  onDragStart = ({ payload }) => {
    return payload;
  }

  onListDrop = ({ removedIndex, addedIndex }) => {
    if (removedIndex !== addedIndex) {
      this.props.moveList({fromIndex: removedIndex, targetIndex: addedIndex});
    }
  }

  getListDetails = index => {
    return this.props.activeBoard.lists[index];
  }

  getCardDetails = (listIndex, cardIndex) => {
    const list = this.props.activeBoard.lists[listIndex] || {};
    const cards = list.cards || [];
    return Object.assign({}, cards[cardIndex], {listIndex, cardIndex});
  }

  getListNameNode = (list) => {
    const listName = list.name;
    if (!listName) {
      return this.unCategorized;
    }
    const { dtable, dtableValue, activeBoard } = this.props;
    const { tables, collaborators, cellType } = dtableValue;
    const { selectedTable, groupbyColumn } = activeBoard;
    const row = { [groupbyColumn.key]: listName };
    return (
      <CellFormatter
        tables={tables}
        column={groupbyColumn}
        row={row}
        table={selectedTable}
        CellType={cellType}
        collaborators={collaborators}
        dtable={dtable}
      />
    );
  }

  render() {
    const { activeBoard } = this.props;
    const { lists, canAddList, draggable } = activeBoard;

    return (
      <div className="kanban-board-wrapper" draggable={false}>
        <div className="kanban-board">
          <Container
            orientation="horizontal"
            dragClass={'plugin-kanban-dragged-list'}
            lockAxis="x"
            dropClass={''}
            groupName={this.groupName}
            onDragStart={this.onDragStart}
            onDrop={this.onListDrop}
            getChildPayload={this.getListDetails}
          >
            {Array.isArray(lists) && lists.map((list, index) => {
              const { name, cards } = list;
              const listName = name || this.unCategorized;
              const listKey = `plugin-kanban-list-${listName}`;
              const listNameNode = this.getListNameNode(list);
              const listToRender = (
                <List
                  key={listKey}
                  boardId={this.groupName}
                  listIndex={index}
                  listName={listName}
                  listNameNode={listNameNode}
                  cards={cards}
                  getCardDetails={this.getCardDetails}
                  draggable={draggable && name !== null}
                  onCardClick={this.props.onCardClick}
                  onAddCard={this.props.onAddCard.bind(this, index)}
                  moveCard={this.props.moveCard}
                />
              );
              if (draggable && name !== null) {
                return (
                  <Draggable key={listKey}>{listToRender}</Draggable>
                );
              }
              return listToRender;
            })}
            {canAddList &&
              <AddList
                onAddList={this.props.addNewList}
              />
            }
          </Container>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { dtableValue, activeBoard } = state;
  return {
    dtableValue,
    activeBoard,
  };
};

BoardContainer.propTypes = {
  dtableValue: PropTypes.object,
  activeBoard: PropTypes.object,
  moveList: PropTypes.func,
  onCardClick: PropTypes.func,
  onCardAdd: PropTypes.func,
  moveCard: PropTypes.func,
  addNewList: PropTypes.func,
};

BoardContainer.defaultProps = {
  activeBoard: {lists: []},
};

export default connect(mapStateToProps, null)(BoardContainer);
