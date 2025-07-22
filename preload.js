const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {    //  보안: 컨텍스트 격리(Context Isolation)
    saveCSV: (data) => ipcRenderer.invoke('save-csv', data),

    selectServer: (exeList) => ipcRenderer.invoke('select-and-start-server', exeList),

    selectStl: () => ipcRenderer.invoke("select-stl"),

    renderStl: (filePath) => ipcRenderer.invoke("render-stl", filePath),

    showAlert: (message) => ipcRenderer.invoke('showAlert', message)
});