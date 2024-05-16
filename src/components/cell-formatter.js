import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CellType, getLinkCellValue, getTableById, getRowsByIds } from 'dtable-utils';
import {
  TextFormatter,
  NumberFormatter,
  CheckboxFormatter,
  DateFormatter,
  SingleSelectFormatter,
  MultipleSelectFormatter,
  CollaboratorFormatter,
  ImageFormatter,
  FileFormatter,
  SimpleLongTextFormatter,
  GeolocationFormatter,
  LinkFormatter,
  FormulaFormatter,
  CTimeFormatter,
  CreatorFormatter,
  LastModifierFormatter,
  MTimeFormatter,
  AutoNumberFormatter,
  UrlFormatter,
  EmailFormatter,
  DurationFormatter,
  RateFormatter,
  DigitalSignFormatter,
} from 'dtable-ui-component';
import { isValidDigitalSignImageValue } from 'dtable-ui-component/lib/DigitalSignFormatter/utils';
import pluginContext from '../plugin-context';
import { isValidEmail, getMediaUrl, getValueFromPluginConfig } from '../utils/common-utils';

class CellFormatter extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isDataLoaded: false,
      collaborator: null
    };
  }

  componentDidMount() {
    this.calculateCollaboratorData(this.props);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.calculateCollaboratorData(nextProps);
  }

  calculateCollaboratorData = (props) => {
    const { row, column } = props;
    if (column.type === CellType.LAST_MODIFIER) {
      this.getCollaborator(row._last_modifier);
    } else if (column.type === CellType.CREATOR) {
      this.getCollaborator(row._creator);
    }
  };

  getCollaborator = (value) => {
    if (!value) {
      this.setState({ isDataLoaded: true, collaborator: null });
      return;
    }
    this.setState({ isDataLoaded: false, collaborator: null });
    let { collaborators } = this.props;
    let collaborator = collaborators && collaborators.find(c => c.email === value);
    if (collaborator) {
      this.setState({ isDataLoaded: true, collaborator: collaborator });
      return;
    }

    if (!isValidEmail(value)) {
      let mediaUrl = getMediaUrl();
      let defaultAvatarUrl = `${mediaUrl}/avatars/default.png`;
      collaborator = {
        name: value,
        avatar_url: defaultAvatarUrl,
      };
      this.setState({ isDataLoaded: true, collaborator });
      return;
    }

    this.getUserCommonInfo(value).then(res => {
      collaborator = res.data;
      this.setState({ isDataLoaded: true, collaborator });
    }).catch(() => {
      let mediaUrl = getMediaUrl();
      let defaultAvatarUrl = `${mediaUrl}/avatars/default.png`;
      collaborator = {
        name: value,
        avatar_url: defaultAvatarUrl,
      };
      this.setState({ isDataLoaded: true, collaborator });
    });
  };

  getUserCommonInfo = (email, avatarSize = '') => {
    return pluginContext.getUserCommonInfo(email, avatarSize);
  };

  getLinkCellValue = (linkId, table1Id, table2Id, rowId) => {
    const links = window.dtableSDK.getLinks();
    return getLinkCellValue(links, linkId, table1Id, table2Id, rowId);
  };

  getRowsByID = (tableId, rowIds) => {
    const table = this.getTableById(tableId);
    return getRowsByIds(table, rowIds);
  };

  getTableById = (table_id) => {
    const tables = window.dtableSDK.getTables();
    return getTableById(tables, table_id);
  };

  renderCellFormatter = () => {
    const { column, row, collaborators, hideEmptyValues } = this.props;
    const { type: columnType, key: columnKey, data: columnData } = column;
    const { isDataLoaded, collaborator } = this.state;
    const cellValue = row[columnKey];

    // keep using `EMPTY_CELL_FORMATTER` here to be compatible with the old code
    let EMPTY_CELL_FORMATTER = <div className="dtable-ui cell-formatter-container row-cell-empty"></div>;
    if (hideEmptyValues) {
      EMPTY_CELL_FORMATTER = null;
    }

    switch (columnType) {
      case CellType.TEXT: {
        if (!cellValue) return EMPTY_CELL_FORMATTER;
        return <TextFormatter value={cellValue} containerClassName="plugin-kanban-cell-formatter-text" />;
      }
      case CellType.COLLABORATOR: {
        if (!cellValue || cellValue.length === 0) return EMPTY_CELL_FORMATTER;
        return <CollaboratorFormatter value={cellValue} collaborators={collaborators} />;
      }
      case CellType.LONG_TEXT: {
        if (!cellValue) return EMPTY_CELL_FORMATTER;
        return <SimpleLongTextFormatter value={cellValue} />;
      }
      case CellType.IMAGE: {
        if (!cellValue || cellValue.length === 0) return EMPTY_CELL_FORMATTER;
        return <ImageFormatter value={cellValue} isSample />;
      }
      case CellType.GEOLOCATION : {
        if (!cellValue) return EMPTY_CELL_FORMATTER;
        return <GeolocationFormatter value={cellValue} containerClassName="plugin-kanban-cell-formatter-text" />;
      }
      case CellType.NUMBER: {
        if (!cellValue && cellValue !== 0) return EMPTY_CELL_FORMATTER;
        return <NumberFormatter value={cellValue} data={columnData} />;
      }
      case CellType.DATE: {
        if (!cellValue) return EMPTY_CELL_FORMATTER;
        const format = columnData && columnData.format;
        return <DateFormatter value={cellValue} format={format} />;
      }
      case CellType.MULTIPLE_SELECT: {
        if (!cellValue || cellValue.length === 0) return EMPTY_CELL_FORMATTER;
        const options = (columnData && columnData.options) || [];
        return <MultipleSelectFormatter value={cellValue} options={options} />;
      }
      case CellType.SINGLE_SELECT: {
        if (!cellValue) return EMPTY_CELL_FORMATTER;
        const options = (columnData && columnData.options) || [];
        return <SingleSelectFormatter value={cellValue} options={options} />;
      }
      case CellType.FILE: {
        if (!cellValue || cellValue.length === 0) return EMPTY_CELL_FORMATTER;
        return <FileFormatter value={cellValue} isSample />;
      }
      case CellType.CHECKBOX: {
        return <CheckboxFormatter value={cellValue} />;
      }
      case CellType.CTIME: {
        if (!row._ctime) return EMPTY_CELL_FORMATTER;
        return <CTimeFormatter value={row._ctime} />;
      }
      case CellType.MTIME: {
        if (!row._mtime) return EMPTY_CELL_FORMATTER;
        return <MTimeFormatter value={row._mtime} />;
      }
      case CellType.CREATOR: {
        if (!row._creator || !collaborator) return EMPTY_CELL_FORMATTER;
        if (isDataLoaded) {
          return <CreatorFormatter collaborators={[collaborator]} value={row._creator} />;
        }
        return null;
      }
      case CellType.LAST_MODIFIER: {
        if (!row._last_modifier || !collaborator) return EMPTY_CELL_FORMATTER;
        if (isDataLoaded) {
          return <LastModifierFormatter collaborators={[collaborator]} value={row._last_modifier} />;
        }
        return null;
      }
      case CellType.FORMULA:
      case CellType.LINK_FORMULA: {
        let formulaRows = this.props.formulaRows ? { ...this.props.formulaRows } : {};
        let formulaValue = formulaRows[row._id] ? formulaRows[row._id][columnKey] : '';
        if (!formulaValue) return EMPTY_CELL_FORMATTER;
        return <FormulaFormatter value={formulaValue} column={column} collaborators={collaborators} containerClassName="plugin-kanban-cell-formatter-formula" />;
      }
      case CellType.LINK: {
        const linkMetaData = {
          getLinkedCellValue: (linkId, table1Id, table2Id, row_id) => {
            return this.getLinkCellValue(linkId, table1Id, table2Id, row_id);
          },
          getLinkedRows: (tableId, rowIds) => {
            return this.getRowsByID(tableId, rowIds);
          },
          getLinkedTable: (tableId) => {
            return this.getTableById(tableId);
          },
          expandLinkedTableRow: (row, tableId) => {
            return false;
          }
        };
        return <LinkFormatter column={column} row={row} currentTableId={this.props.table._id} linkMetaData={linkMetaData} containerClassName="gallery-link-container" />;
      }
      case CellType.AUTO_NUMBER: {
        if (!cellValue) return EMPTY_CELL_FORMATTER;
        return <AutoNumberFormatter value={cellValue} containerClassName="plugin-kanban-cell-formatter-text" />;
      }
      case CellType.URL: {
        if (!cellValue) return EMPTY_CELL_FORMATTER;
        return <UrlFormatter value={cellValue} containerClassName="plugin-kanban-cell-formatter-text" />;
      }
      case CellType.EMAIL: {
        if (!cellValue) return EMPTY_CELL_FORMATTER;
        return <EmailFormatter value={cellValue} containerClassName="plugin-kanban-cell-formatter-text" />;
      }
      case CellType.DURATION: {
        if (!cellValue) return EMPTY_CELL_FORMATTER;
        const duration_format = columnData && columnData.duration_format;
        return <DurationFormatter value={cellValue} format={duration_format} containerClassName="plugin-kanban-cell-formatter-text" />;
      }
      case CellType.RATE: {
        if (!cellValue) return EMPTY_CELL_FORMATTER;
        return <RateFormatter value={cellValue} data={columnData || {}} />;
      }
      case CellType.DIGITAL_SIGN: {
        const value = isValidDigitalSignImageValue(cellValue);
        if (!value) return EMPTY_CELL_FORMATTER;
        return (
          <DigitalSignFormatter
            isSample
            isSupportPreview={false}
            value={cellValue}
            config={{
              server: getValueFromPluginConfig('server'),
              workspaceID: getValueFromPluginConfig('workspaceID'),
              dtableUuid: getValueFromPluginConfig('dtableUuid')
            }}
          />
        );
      }
      default: return null;
    }
  };

  render() {
    const { column, hideEmptyValues, showFieldNames } = this.props;
    const cellValue = this.renderCellFormatter();
    if (showFieldNames && !(hideEmptyValues && cellValue === null)) {
      return (
        <div className="mt-2">
          <h5 className="card-column-name">{column.name}</h5>
          {cellValue}
        </div>
      );
    }
    return cellValue;
  }
}

CellFormatter.propTypes = {
  hideEmptyValues: PropTypes.bool,
  showFieldNames: PropTypes.bool,
  formulaRows: PropTypes.object,
  column: PropTypes.object.isRequired,
  row: PropTypes.object.isRequired,
  table: PropTypes.object.isRequired,
  collaborators: PropTypes.array,
};

export default CellFormatter;
