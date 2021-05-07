import React, { Fragment }  from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import PluginSelect from './plugin-select';
import { SETTING_KEY } from '../constants';
import * as zIndexes from '../constants/zIndexes';

import '../css/board-setting.css';

class BoardSetting extends React.Component {

  onBoardSettingClick = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
  }

  onModifySettings = (selectedOption) => {
    const { boardSetting } = this.props;
    let { setting_key, value } = selectedOption;
    let updated;
    if (setting_key === SETTING_KEY.TABLE_NAME) {
      updated = {_id: boardSetting._id, name: boardSetting.name, [setting_key]: value};  // Need init settings after select new table.
    } else {
      updated = Object.assign({}, boardSetting, {[setting_key]: value});
    }
    this.updateBoardSetting(updated);
  };

  updateBoardSetting = (boardSettings) => {
    this.props.onUpdateBoardSetting(boardSettings);
  }

  getSelectorColumns = (columns) => {
    const { columnIconConfig, supportGroupbyColumnTypes } = this.props.dtableValue;
    let groupbyColumns = [];
    columns && columns.forEach((c) => {
      const { type, name } = c;
      const columnOption = {
        name,
        value: name,
        iconClass: columnIconConfig[type],
      };
      if (supportGroupbyColumnTypes.includes(type)) {
        groupbyColumns.push(columnOption);
      }
    });
    return { groupbyColumns };
  }

  renderSelector = (options, settingKey) => {
    const { boardSetting } = this.props;
    let selectedOption = options.find(item => item.value === boardSetting[settingKey]);
    if (!selectedOption &&
      (settingKey === SETTING_KEY.TABLE_NAME ||
      settingKey === SETTING_KEY.VIEW_NAME)
    ) {
      selectedOption = options[0];
    }
    return (
      <PluginSelect
        classNamePrefix={'kanban-setting-selector'}
        value={selectedOption}
        options={options}
        onChange={this.onModifySettings}
      />
    );
  }

  getSelectorOptions(selectedTable, { groupbyColumns }) {
    const { tables } = this.props.dtableValue;
    const tableOptions = this.createOptions(tables, SETTING_KEY.TABLE_NAME, 'name');
    const viewOptions = this.createOptions(selectedTable.views, SETTING_KEY.VIEW_NAME, 'name');
    const groupbyColumnOptions = this.createOptions(groupbyColumns, SETTING_KEY.GROUPBY_COLUMN_NAME, 'value');
    return { tableOptions, viewOptions, groupbyColumnOptions };
  }

  createOptions(source, settingKey, valueKey) {
    if (!Array.isArray(source)) {
      return [];
    }
    return source.map((item) => ({
      value: item[valueKey],
      setting_key: settingKey,
      label: (
        <Fragment>
          {item.iconClass && <span className="header-icon"><i className={item.iconClass}></i></span>}
          <span className='select-module select-module-name'>{item.name}</span>
        </Fragment>
      ),
    }));
  }

  render() {
    const { dtableValue, activeBoard } = this.props;
    const { tables } = dtableValue;
    let { selectedTable } = activeBoard;
    selectedTable = selectedTable || tables[0];
    const { groupbyColumns } = this.getSelectorColumns(selectedTable.columns);
    const { tableOptions, viewOptions, groupbyColumnOptions }
      = this.getSelectorOptions(selectedTable, { groupbyColumns });

    return (
      <div className="plugin-kanban-board-setting" style={{zIndex: zIndexes.BOARD_SETTING}} onClick={this.onBoardSettingClick}>
        <div className="setting-container">
          <div className="setting-header">
            <div className="setting-header-container">
              <div className="setting-header-title">{intl.get('Settings')}</div>
              <div className="dtable-font dtable-icon-x btn-close" onClick={this.props.onCloseBoardSetting}></div>
            </div>
          </div>
          <div className="setting-body">
            <div className="setting-list">
              <div className="setting-item table">
                <div className="title">{intl.get('Table')}</div>
                {this.renderSelector(tableOptions, SETTING_KEY.TABLE_NAME)}
              </div>
              <div className="setting-item table-view">
                <div className="title">{intl.get('View')}</div>
                {this.renderSelector(viewOptions, SETTING_KEY.VIEW_NAME)}
              </div>
              
              <div className="split-line"></div>
              <div className="setting-item start-time">
                <div className="title">{intl.get('Groupby')}</div>
                {this.renderSelector(groupbyColumnOptions, SETTING_KEY.GROUPBY_COLUMN_NAME)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { dtableValue, activeBoard } = state;
  return {
    dtableValue,
    activeBoard
  };
};

BoardSetting.propTypes = {
  dtableValue: PropTypes.object,
  boardSetting: PropTypes.object,
  onUpdateBoardSetting: PropTypes.func,
  onCloseBoardSetting: PropTypes.func,
};

export default connect(mapStateToProps, null)(BoardSetting);
