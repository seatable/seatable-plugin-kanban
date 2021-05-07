import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import * as zIndexes from '../constants/zIndexes';

import '../css/dropdown-menu.css';

const propTypes = {
  dropdownMenuPosition: PropTypes.object,
  options: PropTypes.node,
};

class DropdownMenu extends React.Component {

  render() {
    let { dropdownMenuPosition, options } = this.props;
    let dropdownMenuStyle = {
      zIndex: zIndexes.DROPDOWN_MENU,
      ...dropdownMenuPosition,
    };
    return (
      <div className="kanban-dropdown-menu dropdown-menu large show" style={dropdownMenuStyle}>
        {options || <div className="no-options">{intl.get('No_options')}</div>}
      </div>
    );
  }
}

DropdownMenu.propTypes = propTypes;

export default DropdownMenu;
