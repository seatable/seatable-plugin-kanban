import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  settings: PropTypes.object.isRequired,
  updateSettings: PropTypes.func.isRequired,
  settingKey: PropTypes.string.isRequired,
  settingDesc: PropTypes.string.isRequired
};
class ToggleSetting extends React.Component {

  updateSettings = (e) => {
    const { settings, settingKey } = this.props;
    const updated = Object.assign({}, settings, {[settingKey]: e.target.checked});
    this.props.updateSettings(updated);
  }

  render() {
    const { settings, settingKey, settingDesc } = this.props;
    return (
      <label className="custom-switch d-flex position-relative switch-setting-item">
        <input
          type="checkbox"
          className="custom-switch-input"
          checked={settings[settingKey]}
          onChange={this.updateSettings}
          name="custom-switch-checkbox"
        />
        <span className="custom-switch-description text-truncate ml-0">
          {settingDesc}
        </span>
        <span className="custom-switch-indicator"></span>
      </label>
    );
  }
}

ToggleSetting.propTypes = propTypes;

export default ToggleSetting;
