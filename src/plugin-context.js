class PluginContext {

  getConfig() {
    return window.dtable;
  }

  getSettingByKey(key) {
    return window.dtable[key] || '';
  }

  getUserCommonInfo(email, avatar_size) {
    return window.dtableWebAPI.getUserCommonInfo(email, avatar_size);
  }

  expandRow(row, table) {
    window.app && window.app.expandRow && window.app.expandRow(row, table);
  }
}

const pluginContext = new PluginContext();

export default pluginContext;
