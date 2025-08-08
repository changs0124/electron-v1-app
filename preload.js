const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {    //  보안: 컨텍스트 격리(Context Isolation)
    saveCSV: async (data) => await ipcRenderer.invoke('save-csv', data),

    selectServer: async (exeList) => await ipcRenderer.invoke('select-and-start-server', exeList),

    selectStl: async () => await ipcRenderer.invoke("select-stl"),

    renderStl: async (filePath) => await ipcRenderer.invoke("render-stl", filePath),

    showAlert: async (message) => await ipcRenderer.invoke('showAlert', message),

    checkFileExists: async (filePath) => await ipcRenderer.invoke('check-file-exists', filePath)
});