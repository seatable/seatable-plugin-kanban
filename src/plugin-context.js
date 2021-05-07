class PluginContext {

  constructor() {
    this.settings = window.dtable || window.dtablePluginConfig;
    this.api = window.dtableWebAPI || null;
  }

  getSettingByKey(key) {
    return this.settings[key] || '';
  }

  getUserCommonInfo(email, avatar_size) {
    if (!this.api) return Promise.reject();
    return this.api.getUserCommonInfo(email, avatar_size);
  }

  expandRow(row, table) {
    window.app && window.app.expandRow && window.app.expandRow(row, table);
  }
}

const pluginContext = new PluginContext();

export default pluginContext;
