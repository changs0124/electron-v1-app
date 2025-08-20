const { BrowserWindow, app, ipcMain, dialog } = require('electron');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const isDev = !app.isPackaged;

let mainWindow;
let splashWindow;
let serverProcesses = {};

function getPortAndIdByExeKey(exeName, exeList) {
    const temp = exeList.find(c => c.key === exeName);
    return temp ? { port: temp.port, id: temp.id } : null;
}

function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 400,
        height: 300,
        frame: false,
        alwaysOnTop: true,
        resizable: false,
        roundedCorners: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
        }
    })

    const splashEntryURL = isDev ? 'http://localhost:3000/splash.html' : `file://${path.join(app.getAppPath(), "build/splash.html")}`;

    splashWindow.loadURL(splashEntryURL).catch(err => console.error('Failed to load splash URL:', err));

    splashWindow.on('closed', () => (splashWindow = null));
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        autoHideMenuBar: true,
        resizable: false,
        focusable: true,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, '../preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        }
    });

    const entryURL = isDev ? 'http://localhost:3000' : `file://${path.join(app.getAppPath(), "build/index.html")}`;

    mainWindow.loadURL(entryURL).catch(err => console.error('Failed to load URL:', err));

    mainWindow.once('ready-to-show', () => {
        if (splashWindow) {
            splashWindow.destroy(); // close() 대신 destroy()를 권장합니다.
            splashWindow = null;
        }

        mainWindow.show();
    });

    mainWindow.on('closed', () => (mainWindow = null));
}

app.whenReady().then(() => {
    createSplashWindow();
    createWindow()
});

app.on('window-all-closed', () => {
    if (process.platform !== "darwin") app.quit();
});

ipcMain.handle('save-csv', async (event, jsonArray) => {
    if (!Array.isArray(jsonArray) || jsonArray.length === 0) return { success: false, error: 'Invalid or empty data' };

    const headers = Object.keys(jsonArray[0]);
    const rows = jsonArray.map(obj => headers.map(key => obj[key]?.data));

    // CSV 문자열 생성 (Excel 호환: UTF-8 BOM 추가)
    const csvContent = '\uFEFF' + [headers, ...rows].map(row => row.join(',')).join('\n');

    // YYYY-MM-DD
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${dateStr}_${uuidv4().slice(0, 8)}.csv`;

    const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Save CSV file',
        defaultPath: path.join(app.getPath('downloads'), filename),
        filters: [{ name: 'CSV Files', extensions: ['csv'] }]
    });

    if (canceled || !filePath) return { success: false, error: 'File save cancelled' };

    try {
        fs.writeFileSync(filePath, csvContent, 'utf8');
        return { success: true, filePath };
    } catch (e) {
        return { success: false, error: e.message };
    };
});

ipcMain.handle('select-and-start-server', async (event, exeList) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Please select the .exe file',
        filters: [{ name: 'Executable', extensions: ['exe'] }],
        properties: ['openFile']
    });

    if (canceled || !filePaths.length) return { success: false, error: 'File selection cancelled' };

    const exePath = filePaths[0];
    const fileName = path.basename(exePath);

    // 허용 목록에 있는지 체크
    const serverInfo = getPortAndIdByExeKey(fileName, exeList);
    if (serverInfo === null) return { success: false, error: `This file is not allowed: ${fileName}` };

    // 2) 이미 실행 중인지 확인
    const existing = serverProcesses[exePath];
    if (existing && !existing.killed) return { success: false, error: 'The server is already running.', fileName, id: serverInfo.id, port: serverInfo.port };

    // 3) 새 프로세스 실행 (콘솔 창 없이)
    try {
        const cp = spawn(exePath, [], {
            cwd: path.dirname(exePath),
            detached: true,          // 부모 프로세스와 분리
            stdio: 'ignore',         // stdin/stdout/stderr 모두 무시
            windowsHide: true        // 콘솔 창 숨김
        });
        // 백그라운드 유지
        cp.unref();

        // 프로세스 종료 시 맵에서 제거
        cp.on('exit', () => { delete serverProcesses[exePath]; });

        serverProcesses[exePath] = cp;

        return { success: true, fileName, exePath, id: serverInfo.id, port: serverInfo.port };
    } catch (e) {
        return { success: false, error: e.message, fileName };
    };
});

// [ 기능 2 ] .stl 파일명 / 파일 경로 리턴
ipcMain.handle('select-stl', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        filters: [{ name: 'STL Files', extensions: ['stl'] }],
        properties: ['openFile']
    });

    if (canceled || filePaths.length === 0) return { success: false, error: 'File selection cancelled' };

    const filePath = filePaths[0];
    const fileName = path.basename(filePath);

    return { success: true, fileName, filePath };
});

// [ 기능 3 ] .stl 렌더링
ipcMain.handle('render-stl', async (event, filePath) => {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        return fileBuffer;
    } catch (e) {
        return { success: false, error: e.message };
    }
});

// [ 기능 4 ] custom alertBox
ipcMain.handle('showAlert', async (event, message) => {
    const options = {
        type: 'info',
        title: 'Inform',
        message: message
    };

    const result = await dialog.showMessageBox(mainWindow, options);
    return result.response;
});

ipcMain.handle('check-file-exists', async (event, filePath) => {
    const exists = fs.existsSync(filePath);
    if (exists) {
        return { success: true, exists };
    } else {
        return { success: false, error: 'The file does not exist.' };
    }
});