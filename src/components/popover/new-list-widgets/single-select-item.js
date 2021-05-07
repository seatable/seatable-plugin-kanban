import React, { Component, Fragment } from 'react';
import { Input } from 'reactstrap';
import PluginPopover from '../../plugin-popover';

class SingleSelectItem extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isShowColorSelector: false,
    };
  }

  onToggleColorSelector = (event) => {
    if (event) {
      event.stopPropagation();
      event.nativeEvent && event.nativeEvent.stopImmediatePropagation();
    }
    this.setState({ isShowColorSelector: !this.state.isShowColorSelector});
    this.props.setPluginPopoverState();
  }

  onListNameChange = (evt) => {
    const listName = evt.target.value;
    const newList = Object.assign({}, this.props.newList, {listName});
    this.props.updateNewList(newList);
  }

  onChangeOptionColor = (optionItem) => {
    const { COLOR, TEXT_COLOR } = optionItem;
    const newList = Object.assign({}, this.props.newList, {optionColor: COLOR, textColor: TEXT_COLOR});
    this.props.updateNewList(newList);
    this.onToggleColorSelector();
  }

  render() {
    const { optionColors, newList } = this.props;
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
              {optionColors.map((item, index)=>{
                let { COLOR: itemOptionColor, BORDER_COLOR: borderColor, TEXT_COLOR: textColor } = item;
                return (
                  <div key={itemOptionColor} className="col-auto" onClick={this.onChangeOptionColor.bind(this, item)}>
                    <label className="colorinput">
                      <span className="colorinput-color" style={{backgroundColor: itemOptionColor, borderColor: borderColor}}>
                        {optionColor === itemOptionColor &&
                          <i className="dtable-font dtable-icon-check-mark ml-1" style={{color: textColor}}></i>
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

export default SingleSelectItem;
