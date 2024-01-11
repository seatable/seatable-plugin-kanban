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
    const { tables, collaborators } = dtableValue;
    let { selectedTable, selectedView, titleColumn, formulaRows, configuredColumns, hideEmptyValues, showFieldNames, wrapText } = activeBoard;
    selectedTable = selectedTable || tables[0];
    selectedView = selectedView || selectedTable.views[0];
    const columns = this.props.getViewShownColumns(selectedView, selectedTable);
    titleColumn = titleColumn || columns[0];

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
      table: selectedTable,
      tables,
      collaborators,
      formulaRows
    };

    return (
      <article
        data-id={listIndex}
        className={classNames('plugin-kanban-card movable', {
          'draggable': cardDraggable
        })}
        onClick={this.props.onCardClick}
      >
        <Fragment>
          <div className="name-cell-container">
            <CellFormatter
              column={titleColumn}
              {...cellFormatterProps}
            />
          </div>
          <div className={classNames({
            'plugin-kanban-card-body-wrap-text': wrapText
          })}>
            {shownColumns.map((column, index) => (
              <CellFormatter
                key={index}
                column={column}
                hideEmptyValues={hideEmptyValues}
                showFieldNames={showFieldNames}
                {...cellFormatterProps}
              />
            ))}
          </div>
        </Fragment>
      </article>
    );
  }
}

Card.propTypes = {
  cardDraggable: PropTypes.bool,
  card: PropTypes.object,
  dtableValue: PropTypes.object,
  activeBoard: PropTypes.object,
  listIndex: PropTypes.number.isRequired,
  onCardClick: PropTypes.func,
  getViewShownColumns: PropTypes.func,
};

const mapStateToProps = (state) => {
  const { dtableValue, activeBoard } = state;
  return {
    dtableValue,
    activeBoard,
  };
};

export default connect(mapStateToProps, null)(Card);
