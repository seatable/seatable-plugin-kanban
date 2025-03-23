import React from 'react';
import { Popover } from 'reactstrap';
import PropTypes from 'prop-types';
import isHotkey from 'is-hotkey';
import { getEventClassName } from '../utils/common-utils';

const propTypes = {
  target: PropTypes.string.isRequired,
  innerClassName: PropTypes.string,
  popoverClassName: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  hidePluginPopover: PropTypes.func.isRequired,
  hidePluginPopoverWithEsc: PropTypes.func,
  hideArrow: PropTypes.bool,
  canHidePluginPopover: PropTypes.bool,
  modifiers: PropTypes.object
};

class PluginPopover extends React.Component {

  popoverRef = null;

  static defaultProps = {
    hideArrow: true,
    canHidePluginPopover: true
  };

  componentDidMount() {
    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('popstate', this.onHistoryState);
    const firstColor = document.querySelector('#kanban-color-0');
    firstColor && firstColor.focus();
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('popstate', this.onHistoryState);
  }

  onHistoryState = (e) => {
    e.preventDefault();
    this.props.hidePluginPopover(e);
  };

  onKeyDown = (e) => {
    if (isHotkey('esc', e)) {
      e.preventDefault();
      this.props.hidePluginPopoverWithEsc();
    } else if (isHotkey('enter', e)) {
      // Resolve the default behavior of the enter key when entering formulas is blocked
      const { canHidePluginPopover } = this.props;
      if (canHidePluginPopover) return;
      e.stopImmediatePropagation();
    }
  };

  onMouseDown = (e) => {
    const { canHidePluginPopover } = this.props;
    if (!canHidePluginPopover) return;
    if (this.popoverRef && e && getEventClassName(e).indexOf('popover') === -1 && !this.popoverRef.contains(e.target)) {
      this.props.hidePluginPopover(e);
    }
  };

  onPopoverInsideClick = (e) => {
    e.stopPropagation();
  };

  render() {
    const { target, innerClassName, popoverClassName, hideArrow, modifiers } = this.props;
    return (
      <Popover
        placement="bottom-start"
        isOpen={true}
        target={target}
        fade={false}
        hideArrow={hideArrow}
        innerClassName={innerClassName}
        className={popoverClassName}
        modifiers={modifiers}
      >
        <div ref={ref => this.popoverRef = ref} onClick={this.onPopoverInsideClick}>
          {this.props.children}
        </div>
      </Popover>
    );
  }
}

PluginPopover.propTypes = propTypes;

export default PluginPopover;
