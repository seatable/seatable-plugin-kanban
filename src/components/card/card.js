import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import intl from 'react-intl-universal';

class Card extends Component {
  
  constructor(props) {
    super(props);
    this.unnamedRecord = intl.get('Unnamed_record');
  }

  render()  {
    const { listIndex, name, cardDraggable } = this.props;
    const cardNameNode = name || this.unnamedRecord;
    return (
      <article
        data-id={listIndex}
        onClick={this.props.onCardClick}
        className="plugin-kanban-card movable"
      >
        <header className="plugin-kanban-card-header">
          <span className={classNames('plugin-kanban-card-title', {'draggable': cardDraggable})}>
            {cardNameNode}
          </span>
        </header>
      </article>
    );
  }
}

Card.propTypes = {
  listIndex: PropTypes.number.isRequired,
  name: PropTypes.string,
  onCardClick: PropTypes.func,
};

export default Card;
