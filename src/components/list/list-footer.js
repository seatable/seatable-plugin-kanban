import React from 'react';
import intl from 'react-intl-universal';

export default ({ onAddCard, collapsed }) => (
  <div className='list-footer'>
    <div className='btn-add-card' onClick={onAddCard}>
      <i className='icon-add-card dtable-font dtable-icon-add-table'></i>
      <span className='btn-text'>{intl.get('Add_a_new_record')}</span>
    </div>
    {/* {collapsed ? (
      <span className='btn-expand btn-toggle-expand'></span>
    ) : (
      <span className='btn-collapse btn-toggle-expand'></span>
    )} */}
  </div>
);
