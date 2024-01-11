import React from 'react';
import intl from 'react-intl-universal';
import PropTypes from 'prop-types';

const propTypes = {
  onAddCard: PropTypes.func,
};

const ListFooter = ({ onAddCard }) => {
  return (
    <div className="list-footer">
      <div className="btn-add-card" onClick={onAddCard}>
        <i className="icon-add-card dtable-font dtable-icon-add-table"></i>
        <span className="btn-text">{intl.get('Add_a_new_record')}</span>
      </div>
    </div>
  );
};

ListFooter.propTypes = propTypes;

export default ListFooter;
