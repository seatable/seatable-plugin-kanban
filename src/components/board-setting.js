import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { COLUMNS_ICON_CONFIG, getNonArchiveViews, getNonPrivateViews } from 'dtable-utils';
import { FieldDisplaySetting, DTableSelect } from 'dtable-ui-component';
import ToggleSetting from './toggle-setting';
import { SETTING_KEY } from '../constants';
import * as zIndexes from '../constants/zIndexes';

import '../css/board-setting.css';
import { handleEnterKeyDown } from '../utils/common-utils';

class BoardSetting extends React.Component {

  onModifySettings = (selectedOption) => {
    const { boardSetting } = this.props;
    let { setting_key, value } = selectedOption;
    let updated;
    if (setting_key === SETTING_KEY.TABLE_NAME) {
      updated = { _id: boardSetting._id, name: boardSetting.name, [setting_key]: value }; // Need init settings after select new table.
    } else {
      updated = Object.assign({}, boardSetting, { [setting_key]: value });
    }
    this.updateBoardSetting(updated);
  };

  updateBoardSetting = (boardSettings) => {
    this.props.onUpdateBoardSetting(boardSettings);
  };

  getSelectorColumns = (columns) => {
    const { supportGroupbyColumnTypes, unsupportedSetTitleFieldTypes } = this.props.dtableValue;
    let groupbyColumns = [];
    let titleColumns = [];
    columns && columns.forEach((column) => {
      const { type, name } = column;
      const columnOption = {
        name,
        value: name,
        iconClass: COLUMNS_ICON_CONFIG[type],
      };
      if (supportGroupbyColumnTypes.includes(type)) {
        groupbyColumns.push(columnOption);
      }
      if (!unsupportedSetTitleFieldTypes[type]) {
        titleColumns.push(columnOption);
      }
    });
    return { groupbyColumns, titleColumns };
  };

  renderSelector = (options, settingKey) => {
    const { boardSetting } = this.props;
    let selectedOption = options.find(item => item.value === boardSetting[settingKey]);
    if (!selectedOption && (
      settingKey === SETTING_KEY.TABLE_NAME ||
      settingKey === SETTING_KEY.VIEW_NAME ||
      settingKey === SETTING_KEY.TITLE_COLUMN_NAME
    )) {
      selectedOption = options[0];
    }
    return (
      <DTableSelect
        classNamePrefix={'kanban-setting-selector'}
        value={selectedOption}
        options={options}
        onChange={this.onModifySettings}
      />
    );
  };

  getSelectorOptions(selectedTable, { groupbyColumns, titleColumns }) {
    const { tables } = this.props.dtableValue;
    const views = getNonPrivateViews(getNonArchiveViews((selectedTable.views)));
    const tableOptions = this.createOptions(tables, SETTING_KEY.TABLE_NAME, 'name');
    const viewOptions = this.createOptions(views, SETTING_KEY.VIEW_NAME, 'name');
    const groupbyColumnOptions = this.createOptions(groupbyColumns, SETTING_KEY.GROUPBY_COLUMN_NAME, 'value');
    const titleColumnOptions = this.createOptions(titleColumns, SETTING_KEY.TITLE_COLUMN_NAME, 'value');
    return { tableOptions, viewOptions, groupbyColumnOptions, titleColumnOptions };
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

  updateColumn = (targetColumnKey, targetShown) => {
    const { boardSetting: settings } = this.props;
    settings.columns = this.configuredColumns.map(item => {
      if (item.key == targetColumnKey) {
        item.shown = targetShown;
      }
      return item;
    });
    this.props.onUpdateBoardSetting(settings);
  };

  moveColumn = (targetColumnKey, targetIndexColumnKey) => {
    const { boardSetting: settings } = this.props;
    const configuredColumns = this.configuredColumns;
    const targetColumn = configuredColumns.filter(column => column.key == targetColumnKey)[0];
    const originalIndex = configuredColumns.indexOf(targetColumn);
    const targetIndexColumn = configuredColumns.filter(column => column.key == targetIndexColumnKey)[0];
    const targetIndex = configuredColumns.indexOf(targetIndexColumn);
    configuredColumns.splice(originalIndex, 1);
    configuredColumns.splice(targetIndex, 0, targetColumn);
    settings.columns = configuredColumns;
    this.props.onUpdateBoardSetting(settings);
  };

  onToggleColumnsVisibility = (columns, allColumnsShown) => {
    const { boardSetting: settings } = this.props;
    const updatedColumns = columns.map(column => ({
      ...column,
      shown: !allColumnsShown,
    }));
    settings.columns = updatedColumns;
    this.props.onUpdateBoardSetting(settings);
  };

  getCurrentConfiguredColumns = (columns) => {
    const { boardSetting: settings } = this.props;

    const initialConfiguredColumns = columns.map((item, index) => {
      return {
        key: item.key,
        shown: false
      };
    });

    let configuredColumns = initialConfiguredColumns;
    if (settings.columns) {
      const baseConfiguredColumns = settings.columns.filter(item => {
        return columns.some(c => item.key == c.key);
      });
      const addedColumns = columns
        .filter(item => !baseConfiguredColumns.some(c => item.key == c.key))
        .map(item => ({ key: item.key, shown: false }));
      configuredColumns = baseConfiguredColumns.concat(addedColumns);
    }
    return configuredColumns;
  };

  render() {
    const { dtableValue, activeBoard, boardSetting } = this.props;
    const { tables } = dtableValue;
    let { selectedTable, selectedView, titleColumn } = activeBoard;
    selectedTable = selectedTable || tables[0];
    const columns = this.props.getViewShownColumns(selectedView, selectedTable);
    const { groupbyColumns, titleColumns } = this.getSelectorColumns(columns);
    const { tableOptions, viewOptions, groupbyColumnOptions, titleColumnOptions }
      = this.getSelectorOptions(selectedTable, { groupbyColumns, titleColumns });

    titleColumn = titleColumn || columns[0];
    this.configuredColumns = this.getCurrentConfiguredColumns(columns.filter(
      column => column.key != titleColumn.key
    ));
    const configuredColumns = this.configuredColumns.map((item, index) => {
      const targetItem = columns.filter(c => c.key == item.key)[0];
      return Object.assign({}, targetItem, item);
    });
    const allColumnsShown = configuredColumns.every(column => column.shown);
    const textProperties = {
      titleValue: intl.get('Other_fields_shown_in_kanban'),
      bannerValue: intl.get('Fields'),
      hideValue: intl.get('Hide_all'),
      showValue: intl.get('Show_all'),
    };

    return (
      <div className="plugin-kanban-board-setting" style={{ zIndex: zIndexes.BOARD_SETTING }}>
        <div className="setting-container">
          <div className="setting-header">
            <div className="setting-header-container">
              <h3 className="h5 m-0">{intl.get('Settings')}</h3>
              <i
                className="dtable-font dtable-icon-x"
                id="border-setting-close-btn"
                tabIndex={0}
                onClick={this.props.onCloseBoardSetting}
                onKeyDown={handleEnterKeyDown(this.props.onCloseBoardSetting)}
              >
              </i>
            </div>
          </div>
          <div className="setting-body">
            <div className="setting-list">
              <div className="setting-item table-setting">
                <div className="title">{intl.get('Table')}</div>
                {this.renderSelector(tableOptions, SETTING_KEY.TABLE_NAME)}
              </div>
              <div className="setting-item view-setting">
                <div className="title">{intl.get('View')}</div>
                {this.renderSelector(viewOptions, SETTING_KEY.VIEW_NAME)}
              </div>

              <div className="split-line"></div>
              <div className="setting-item">
                <div className="title">{intl.get('Groupby')}</div>
                {this.renderSelector(groupbyColumnOptions, SETTING_KEY.GROUPBY_COLUMN_NAME)}
              </div>

              <div className="split-line"></div>
              <div className="setting-item">
                <div className="title">{intl.get('Title_field')}</div>
                {this.renderSelector(titleColumnOptions, SETTING_KEY.TITLE_COLUMN_NAME)}
              </div>

              <div className="split-line"></div>
              <div className="setting-item">
                <ToggleSetting
                  settings={boardSetting}
                  settingKey="hideEmptyValues"
                  settingDesc={intl.get('Do_not_show_empty_values')}
                  updateSettings={this.updateBoardSetting}
                />
              </div>

              <div className="split-line"></div>
              <div className="setting-item">
                <ToggleSetting
                  settings={boardSetting}
                  settingKey="showFieldNames"
                  settingDesc={intl.get('Show_field_names')}
                  updateSettings={this.updateBoardSetting}
                />
              </div>

              <div className="split-line"></div>
              <div className="setting-item">
                <ToggleSetting
                  settings={boardSetting}
                  settingKey="wrapText"
                  settingDesc={intl.get('Wrap_text')}
                  updateSettings={this.updateBoardSetting}
                />
              </div>

              <div className="split-line"></div>
              <div className="setting-item">
                <FieldDisplaySetting
                  fields={configuredColumns}
                  textProperties={textProperties}
                  fieldAllShown={allColumnsShown}
                  onClickField={this.updateColumn}
                  onMoveField={this.moveColumn}
                  onToggleFieldsVisibility={() => this.onToggleColumnsVisibility(configuredColumns, allColumnsShown)}
                />
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
  activeBoard: PropTypes.object,
  onUpdateBoardSetting: PropTypes.func,
  onCloseBoardSetting: PropTypes.func,
  getViewShownColumns: PropTypes.func,
};

export default connect(mapStateToProps, null)(BoardSetting);
