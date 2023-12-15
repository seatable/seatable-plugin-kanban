import React, { Component } from 'react';
import PropTypes from 'prop-types';
import shallowEqual from 'shallowequal';
import ListHeader from './list-header';
import ListFooter from './list-footer';
import Card from '../card/card';
import Container from '../dnd/container';
import Draggable from '../dnd/draggable';

class List extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      currentPage: this.props.currentPage,
      isDraggingOver: false,
    };
  }

  get groupName() {
    return `plugin_kanban_${this.props.boardId}_list`;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!shallowEqual(this.props.cards, nextProps.cards)) {
      this.setState({
        currentPage: nextProps.currentPage
      });
    }
  }

  handleScroll = (evt) => {
    const node = evt.target;
    const elemScrollPosition = node.scrollHeight - node.scrollTop - node.clientHeight;
    const { onListScroll } = this.props;

    // In some browsers and/or screen sizes a decimal rest value between 0 and 1 exists, so it should be checked on < 1 instead of < 0
    if (elemScrollPosition < 1 && onListScroll && !this.state.loading) {
      const { currentPage } = this.state;
      this.setState({loading: true});
      const nextPage = currentPage + 1;
      onListScroll(nextPage, this.props.id).then(moreCards => {
        if ((moreCards || []).length > 0) {
          this.props.actions.paginateList({
            listName: this.props.listName,
            newCards: moreCards,
            nextPage: nextPage
          });
        }
        this.setState({loading: false});
      });
    }
  };

  listDidMount = node => {
    if (node) {
      node.addEventListener('scroll', this.handleScroll);
    }
  };

  handleCardClick = (card, evt) => {
    evt.stopPropagation();
    this.props.onCardClick(card.row);
  };

  shouldAcceptDrop = sourceContainerOptions => {
    return sourceContainerOptions.groupName === this.groupName;
  };

  onDragStart = ({ payload }) => {
    return payload;
  };

  onDragEnd = (listIndex, result) => {
    if (this.state.isDraggingOver) {
      this.setState({isDraggingOver: false});
    }
    const { removedIndex, addedIndex, payload } = result;
    const { listIndex: fromListIndex, cardIndex: fromCardIndex } = payload;
    if (fromListIndex === listIndex && removedIndex === addedIndex) {
      return;
    }
    if (fromCardIndex !== null && addedIndex !== null) {
      this.props.moveCard({
        fromListIndex,
        fromCardIndex,
        targetListIndex: listIndex,
        targetCardIndex: addedIndex,
      });
    }
  };

  renderHeader = () => {
    const { listNameNode, draggable } = this.props;
    return (
      <ListHeader
        listNameNode={listNameNode}
        draggable={draggable}
      />
    );
  };

  renderDragContainer = () => {
    const { listIndex, cards } = this.props;
    const cardList = cards.map((cardItem, idx) => {
      const card = Object.assign({}, cardItem, {listIndex, cardIndex: idx});
      const { id: cardId } = card;
      return (
        <Draggable key={`plugin-kanban-card-${cardId}`}>
          <Card
            index={idx}
            listIndex={listIndex}
            card={card}
            onCardClick={this.handleCardClick.bind(this, card)}
            getViewShownColumns={this.props.getViewShownColumns}
            cardDraggable
          />
        </Draggable>
      );
    });

    return (
      <div className="scrollable-list" onScroll={this.handleScroll}>
        <Container
          orientation="vertical"
          groupName={this.groupName}
          dragClass={'plugin-kanban-dragged-card'}
          dropClass={''}
          onDragStart={this.onDragStart}
          onDrop={e => this.onDragEnd(listIndex, e)}
          onDragEnter={() => this.setState({isDraggingOver: true})}
          onDragLeave={() => this.setState({isDraggingOver: false})}
          shouldAcceptDrop={this.shouldAcceptDrop}
          getChildPayload={index => this.props.getCardDetails(listIndex, index)}>
          {cardList}
        </Container>
      </div>
    );
  };

  render() {
    return (
      <section
        draggable={false}
        className={'plugin-kanban-list'}
      >
        {this.renderHeader()}
        {this.renderDragContainer()}
        <ListFooter onAddCard={this.props.onAddCard} />
      </section>
    );
  }
}

List.propTypes = {
  boardId: PropTypes.string,
  cards: PropTypes.array,
  currentPage: PropTypes.number,
  draggable: PropTypes.bool,
  onCardClick: PropTypes.func,
  onAddCard: PropTypes.func,
  moveCard: PropTypes.func,
  onListScroll: PropTypes.func,
  getViewShownColumns: PropTypes.func,
};

export default List;
