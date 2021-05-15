import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import CellFormatter from '../cell-formatter';

class Card extends Component {

  render()  {
    const {
      listIndex, cardDraggable, card,
      dtableValue, activeBoard
    } = this.props;
    const { dtable, tables, collaborators, cellType } = dtableValue;
    let { selectedTable, formulaRows, configuredColumns } = activeBoard;
    selectedTable = selectedTable || tables[0];
    const columns = selectedTable.columns;

    let shownColumns = [];
    if (configuredColumns) {
      shownColumns = configuredColumns.filter(item => {
        return item.shown && columns.some(c => item.key == c.key);
      }).map((item, index) => {
        const targetItem = columns.filter(c => c.key == item.key)[0];
        return Object.assign({}, targetItem, item);
      });
    }

    const cellFormatterProps = {
      row: card.row,
      CellType: cellType,
      table: selectedTable,
      dtable,
      tables,
      collaborators,
      formulaRows
    };

    return (
      <article
        data-id={listIndex}
        className={classNames('plugin-kanban-card movable', {'draggable': cardDraggable})}
      >
        <Fragment>
          <div onClick={this.props.onCardClick} className="name-cell-container">
            <CellFormatter
              column={columns[0]}
              {...cellFormatterProps}
            />
          </div>
          {shownColumns.map((column, index) => (
            <CellFormatter
              key={index}
              column={column}
              {...cellFormatterProps}
            />
          ))}
        </Fragment>
      </article>
    );
  }
}

Card.propTypes = {
  dtableValue: PropTypes.object,
  activeBoard: PropTypes.object,
  listIndex: PropTypes.number.isRequired,
  onCardClick: PropTypes.func,
};

const mapStateToProps = (state) => {
  const { dtableValue, activeBoard } = state;
  return {
    dtableValue,
    activeBoard,
  };
};

export default connect(mapStateToProps, null)(Card);
