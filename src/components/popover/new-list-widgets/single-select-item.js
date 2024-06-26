import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'reactstrap';
import { SELECT_OPTION_COLORS } from 'dtable-utils';
import PluginPopover from '../../plugin-popover';
import { handleEnterKeyDown } from '../../../utils/common-utils';
import intl from 'react-intl-universal';

const propTypes = {
  newList: PropTypes.object,
  setPluginPopoverState: PropTypes.func,
  updateNewList: PropTypes.func,
};

class SingleSelectItem extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isShowColorSelector: false,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { isShowColorSelector } = this.state;
    const { isShowColorSelector: prevSetting } = prevState;
    const selector = document.getElementById('plugin-kanban-option-item-id');
    !isShowColorSelector && prevSetting && selector && selector.focus();
  }

  onToggleColorSelector = (event) => {
    if (event) {
      event.stopPropagation();
      event.nativeEvent && event.nativeEvent.stopImmediatePropagation();
    }
    this.setState({ isShowColorSelector: !this.state.isShowColorSelector });
    this.props.setPluginPopoverState();
  };

  onListNameChange = (evt) => {
    const listName = evt.target.value;
    const newList = Object.assign({}, this.props.newList, { listName });
    this.props.updateNewList(newList);
  };

  onChangeOptionColor = (optionItem) => {
    const { COLOR, TEXT_COLOR } = optionItem;
    const newList = Object.assign({}, this.props.newList, { optionColor: COLOR, textColor: TEXT_COLOR });
    this.props.updateNewList(newList);
    this.onToggleColorSelector();
  };

  render() {
    const { newList } = this.props;
    const { isShowColorSelector } = this.state;
    let { optionColor, textColor, lisName } = newList || {};
    return (
      <Fragment>
        <div className="plugin-kanban-selected-option">
          <span
            className="plugin-kanban-option-color"
            onClick={this.onToggleColorSelector}
            style={{ backgroundColor: optionColor }}
            id="plugin-kanban-option-item-id"
            aria-label={intl.get('Color_picker')}
            tabIndex={0}
            onKeyDown={handleEnterKeyDown(this.onToggleColorSelector)}

          >
            <i className="dtable-font dtable-icon-drop-down" style={{ color: textColor }}></i>
          </span>
          <div className="editing-list-name">
            <Input className="list-name-input" value={lisName} onChange={this.onListNameChange} />
          </div>
        </div>
        {isShowColorSelector &&
          <PluginPopover
            target='plugin-kanban-option-item-id'
            hidePluginPopover={this.onToggleColorSelector}
            hidePluginPopoverWithEsc={this.onToggleColorSelector}
            popoverClassName="plugin-kanban-option-color-popover"
          >
            <div className="row gutters-xs">
              {SELECT_OPTION_COLORS.map((item, index) => {
                let { COLOR: itemOptionColor, BORDER_COLOR: borderColor, TEXT_COLOR: textColor } = item;
                return (
                  <div
                    key={itemOptionColor}
                    className="col-auto"
                    onClick={this.onChangeOptionColor.bind(this, item)}
                  >
                    <label className="colorinput">
                      <span
                        className="colorinput-color"
                        style={{ backgroundColor: itemOptionColor, borderColor: borderColor }}
                        tabIndex={0}
                        id={`kanban-color-${index}`}
                        onKeyDown={handleEnterKeyDown(this.onChangeOptionColor.bind(this, item))}
                        aria-label={'color:' + itemOptionColor}
                      >
                        {optionColor === itemOptionColor &&
                          <i className="dtable-font dtable-icon-check-mark ml-1" style={{ color: textColor }}></i>
                        }
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
          </PluginPopover>
        }
      </Fragment>
    );
  }
}

SingleSelectItem.propTypes = propTypes;

export default SingleSelectItem;
