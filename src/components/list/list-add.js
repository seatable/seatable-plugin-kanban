import React, { Component } from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import ModalPortal from '../dialog/modal-portal';
import NewListPopover from '../popover/new-list-popover';

class ListAdd extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isShowAddListPopover: false,
    };
  }

  toggleAddList = () => {
    this.setState({isShowAddListPopover: !this.state.isShowAddListPopover});
  }

  onHideAddListPopover = () => {
    this.setState({isShowAddListPopover: false});
  }

  onAddListConfirm = (list) => {
    this.props.onAddList(list);
    this.onHideAddListPopover();
  }

  render() {
    return (
      <div id="plugin-kanban-btn-add-list" className="plugin-kanban-btn-add-list" onClick={this.toggleAddList}>
        <i className="icon-add-list dtable-font dtable-icon-add-table"></i>
        <span className="btn-text">{intl.get('Add_another_list')}</span>
        {this.state.isShowAddListPopover &&
          <ModalPortal>
            <NewListPopover
              onAddListCancel={this.onHideAddListPopover}
              onAddListConfirm={this.onAddListConfirm}
            />
          </ModalPortal>
        }
      </div>
    );
  }
}

ListAdd.propTypes = {
  onAddList: PropTypes.func,
};

export default ListAdd;
