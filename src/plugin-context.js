class PluginContext {

  getConfig() {
    return window.dtable;
  }

  getSettingByKey(key) {
    return window.dtable[key] || '';
  }

  getUserCommonInfo(email, avatar_size) {
    if (window.dtableWebAPI && window.dtableWebAPI.getUserCommonInfo) {
      return window.dtableWebAPI.getUserCommonInfo(email, avatar_size);
    } else {
      return Promise.reject('getUserCommonInfo API is not defined');
    }
  }

  expandRow(row, table) {
    window.app && window.app.expandRow && window.app.expandRow(row, table);
  }
}

const pluginContext = new PluginContext();

export default pluginContext;
