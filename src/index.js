import React from 'react';
import { createRoot } from 'react-dom/client';
import DTable from 'dtable-sdk';
import App from './app';
import './setting';

class TaskList {

  static async init() {
    const dtableSDK = new DTable();

    // local develop
    window.app = {};
    window.app.state = {};
    window.dtable = {
      ...window.dtablePluginConfig,
    };
    await dtableSDK.init(window.dtablePluginConfig);
    await dtableSDK.syncWithServer();

    window.app.collaborators = dtableSDK.dtableStore.collaborators;
    window.app.state.collaborators = dtableSDK.dtableStore.collaborators;
    window.app.onClosePlugin = this.onClosePlugin;
    window.dtableWebAPI = dtableSDK.dtableWebAPI;
    window.dtableSDK = dtableSDK;
  }

  static onClosePlugin() {
    // close plugin here
  }

  static async execute() {
    await this.init();
    const root = createRoot(document.getElementById('root'));
    root.render(<App isDevelopment showDialog key={(new Date()).getTime()} />);
  }

}

TaskList.execute();

const openBtn = document.getElementById('plugin-controller');
openBtn.addEventListener('click', function () {
  TaskList.execute();
}, false);

