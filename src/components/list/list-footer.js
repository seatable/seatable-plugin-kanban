import React from 'react';
import intl from 'react-intl-universal';
import PropTypes from 'prop-types';
import { handleEnterKeyDown } from '../../utils/common-utils';

const propTypes = {
  onAddCard: PropTypes.func,
};

const ListFooter = ({ onAddCard }) => {
  return (
    <div className="list-footer">
      <div className="btn-add-card"
        onClick={onAddCard}
        tabIndex={0}
        onKeyDown={handleEnterKeyDown(onAddCard)}
        aria-label={intl.get('Add_a_new_record')}
      >
        <i className="icon-add-card dtable-font dtable-icon-add-table"></i>
        <span className="btn-text">{intl.get('Add_a_new_record')}</span>
      </div>
    </div>
  );
};

ListFooter.propTypes = propTypes;

export default ListFooter;
