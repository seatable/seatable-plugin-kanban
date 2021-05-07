import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Alert, Button } from 'reactstrap';
import intl from 'react-intl-universal';
import PluginPopover from '../plugin-popover';
import SingleSelectItem from './new-list-widgets/single-select-item';


import '../../css/add-list-popover.css';

class NewListPopover extends Component {

  constructor(props) {
    super(props);
    this.state = {
      newList: null,
      canHidePluginPopover: true,
      errMessage: '',
    };
  }

  updateNewList = (newList) => {
    this.setState({ newList });
  }

  setPluginPopoverState = () => {
    this.setState({ canHidePluginPopover: !this.state.canHidePluginPopover });
  }

  onAddListConfirm = () => {
    const { newList } = this.state;
    let { listName, ...payload } = newList || {};
    listName = listName && listName.trim();
    if (!listName) {
      this.setState({errMessage: 'Name_is_required'});
      return;
    }
    this.props.onAddListConfirm({listName, payload});
  }

  renderListEditor = () => {
    const { activeBoard, dtableValue } = this.props;
    const { newList } = this.state;
    const { cellType, optionColors } = dtableValue;
    const { groupbyColumn } = activeBoard;
    if (groupbyColumn.type === cellType.SINGLE_SELECT) {
      const defaultOptionColor = optionColors[0];
      const initNewList = newList || { optionColor: defaultOptionColor.COLOR, textColor: defaultOptionColor.TEXT_COLOR };
      return (
        <SingleSelectItem
          newList={initNewList}
          optionColors={optionColors}
          updateNewList={this.updateNewList}
          setPluginPopoverState={this.setPluginPopoverState}
        />
      );
    }
  }

  render() {
    const { errMessage } = this.state;
    const modifiers = {
      offset: {
        offset: 0
      },
      keepTogether: {
        enabled: false
      },
      preventOverflow: {
        padding: 10,
        boundariesElement: document.body
      }
    };
    return (
      <PluginPopover
        target={'plugin-kanban-btn-add-list'}
        popoverClassName="plugin-kanban-add-list-popover"
        hidePluginPopover={this.props.onAddListCancel}
        hidePluginPopoverWithEsc={this.props.onAddListCancel}
        modifiers={modifiers}
        canHidePluginPopover={this.state.canHidePluginPopover}
      >
        <div className="plugin-kanban-add-list-inner">
          {this.renderListEditor()}
          {errMessage && <Alert color="danger" className="mt-6">{intl.get(errMessage)}</Alert>}
          <div className="plugin-kanban-add-list-popover-footer">
            <Button color="secondary" className="mr-4" onClick={this.props.onAddListCancel}>{intl.get('Cancel')}</Button>
            <Button color="primary" onClick={this.onAddListConfirm}>{intl.get('Submit')}</Button>
          </div>
        </div>
      </PluginPopover>
    );
  }
}

NewListPopover.propTypes = {
  onAddListCancel: PropTypes.func,
  onAddListConfirm: PropTypes.func,
};

const mapStateToProps = (state) => {
  const { activeBoard, dtableValue } = state;
  return {
    activeBoard,
    dtableValue,
  };
};

export default connect(mapStateToProps, null)(NewListPopover);
