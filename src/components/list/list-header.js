import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
// import ListMenu from './ListMenu'; // TODO: if required.


const ListHeader = ({ listNameNode, draggable }) => {
  return (
    <div className="list-header">
      <span className={classNames('list-title', {'draggable': draggable})}>
        {listNameNode}
      </span>
      {/* <div className="btn-list-dropdown">
        <i className="toggle-icon dtable-font dtable-icon-drop-down"></i>
      </div> */}
      {/* {canAddLanes && <ListMenu onDelete={onDelete} />} */}
    </div>
  );
};

ListHeader.propTypes = {
  updateTitle: PropTypes.func,
  editLaneTitle: PropTypes.bool,
  canAddLanes: PropTypes.bool,
  laneDraggable: PropTypes.bool,
  label: PropTypes.string,
  name: PropTypes.string,
  onDelete: PropTypes.func,
  onDoubleClick: PropTypes.func,
};

ListHeader.defaultProps = {
  updateTitle: () => {},
  editLaneTitle: false,
  canAddLanes: false
};

export default ListHeader;
