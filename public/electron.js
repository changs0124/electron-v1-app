const { BrowserWindow, app, ipcMain, dialog } = require('electron');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const isDev = !app.isPackaged;

let mainWindow;
let serverProcesses = {};

console.log(serverProcesses); // console.log()는 실행문이므로 세미콜론이 좋습니다.
function getPortAndIdByExeKey(exeName, exeList) {
    const temp = exeList.find(c => c.key === exeName);
    return temp ? { port: temp.port, id: temp.id } : null; // return 문 뒤에 세미콜론이 좋습니다.
} // 함수 선언문 뒤에는 보통 세미콜론을 붙이지 않습니다.

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        autoHideMenuBar: true,
        resizable: false,
        focusable: true,
        webPreferences: {
            preload: path.join(__dirname, '../preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        }
    });

    const entryURL = isDev ? 'http://localhost:3000' : `file://${path.join(app.getAppPath(), "build/index.html")}`;

    mainWindow.loadURL(entryURL).catch(err => console.error('Failed to load URL:', err)); // 메소드 체이닝 마지막에 세미콜론이 좋습니다.
} // 함수 선언문 뒤에는 보통 세미콜론을 붙이지 않습니다.

app.whenReady().then(createWindow); // .then() 메소드 호출 뒤에 세미콜론이 좋습니다.

app.on('window-all-closed', () => {
    if (process.platform !== "darwin") app.quit(); // 실행문 뒤에 세미콜론이 좋습니다.
}); // 콜백 함수가 끝나는 부분이지만, app.on() 호출의 마지막이므로 세미콜론이 좋습니다.

ipcMain.handle('save-csv', async (event, jsonArray) => { // ipcMain.handle : render에서 invoke로 호출 가능한 비동기 함수를 등록하는 메소드.
    if (!Array.isArray(jsonArray) || jsonArray.length === 0) return { success: false, error: 'Invalid or empty data' }; // return 문 뒤에 세미콜론이 좋습니다.

    const headers = Object.keys(jsonArray[0]); // 변수 선언 뒤에 세미콜론이 좋습니다.
    const rows = jsonArray.map(obj => headers.map(key => obj[key])); // 변수 선언 뒤에 세미콜론이 좋습니다.

    // CSV 문자열 생성 (Excel 호환: UTF-8 BOM 추가)
    const csvContent = '\uFEFF' + [headers, ...rows].map(row => row.join(',')).join('\n'); // 변수 선언 뒤에 세미콜론이 좋습니다.

    // YYYY-MM-DD
    const dateStr = new Date().toISOString().split('T')[0]; // 변수 선언 뒤에 세미콜론이 좋습니다.
    const filename = `${dateStr}_${uuidv4().slice(0, 8)}.csv`; // 변수 선언 뒤에 세미콜론이 좋습니다.

    const { canceled, filePath } = await dialog.showSaveDialog({ // 저장 다이얼로그 창
        title: 'Save CSV file',
        defaultPath: path.join(app.getPath('downloads'), filename),
        filters: [{ name: 'CSV Files', extensions: ['csv'] }]
    }); // await 표현식 뒤에 세미콜론이 좋습니다.

    if (canceled || !filePath) return { success: false, error: 'File selection cancelled' }; // return 문 뒤에 세미콜론이 좋습니다.

    try {
        fs.writeFileSync(filePath, csvContent, 'utf8'); // 실행문 뒤에 세미콜론이 좋습니다.
        return { success: true, filePath }; // return 문 뒤에 세미콜론이 좋습니다.
    } catch (e) {
        return { success: false, error: e.message }; // return 문 뒤에 세미콜론이 좋습니다.
    }; // catch 블록의 끝이지만, IPC 핸들러 함수의 마지막 문장이므로 세미콜론이 좋습니다.
});

ipcMain.handle('select-and-start-server', async (event, exeList) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Please select the .exe file',
        filters: [{ name: 'Executable', extensions: ['exe'] }],
        properties: ['openFile']
    }); // await 표현식 뒤에 세미콜론이 좋습니다.

    if (canceled || !filePaths.length) return { success: false, error: 'File selection cancelled' }; // return 문 뒤에 세미콜론이 좋습니다.

    const exePath = filePaths[0]; // 변수 선언 뒤에 세미콜론이 좋습니다.
    const fileName = path.basename(exePath); // 변수 선언 뒤에 세미콜론이 좋습니다.

    // 허용 목록에 있는지 체크
    const serverInfo = getPortAndIdByExeKey(fileName, exeList); // 변수 선언 뒤에 세미콜론이 좋습니다.
    if (serverInfo === null) return { success: false, error: `This file is not allowed: ${fileName}` }; // return 문 뒤에 세미콜론이 좋습니다.

    // 2) 이미 실행 중인지 확인
    const existing = serverProcesses[exePath]; // 변수 선언 뒤에 세미콜론이 좋습니다.
    if (existing && !existing.killed) return { success: false, error: 'The server is already running.', fileName, id: serverInfo.id, port: serverInfo.port }; // return 문 뒤에 세미콜론이 좋습니다.

    // 3) 새 프로세스 실행 (콘솔 창 없이)
    try {
        const cp = spawn(exePath, [], {
            cwd: path.dirname(exePath),
            detached: true,          // 부모 프로세스와 분리
            stdio: 'ignore',         // stdin/stdout/stderr 모두 무시
            windowsHide: true        // 콘솔 창 숨김
        }); // 변수 선언 뒤에 세미콜론이 좋습니다.
        // 백그라운드 유지
        cp.unref(); // 실행문 뒤에 세미콜론이 좋습니다.

        // 프로세스 종료 시 맵에서 제거
        cp.on('exit', () => { delete serverProcesses[exePath]; }); // 실행문 뒤에 세미콜론이 좋습니다. (콜백 함수 내부)

        serverProcesses[exePath] = cp; // 할당문 뒤에 세미콜론이 좋습니다.

        return { success: true, fileName, exePath, id: serverInfo.id, port: serverInfo.port }; // return 문 뒤에 세미콜론이 좋습니다.
    } catch (e) {
        return { success: false, error: e.message, fileName }; // return 문 뒤에 세미콜론이 좋습니다.
    };
});

// [ 기능 2 ] .stl 파일명 / 파일 경로 리턴
ipcMain.handle('select-stl', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        filters: [{ name: 'STL Files', extensions: ['stl'] }],
        properties: ['openFile']
    }); // await 표현식 뒤에 세미콜론이 좋습니다.

    if (canceled || filePaths.length === 0) return { success: false, error: 'File selection cancelled' }; // return 문 뒤에 세미콜론이 좋습니다.

    const filePath = filePaths[0]; // 변수 선언 뒤에 세미콜론이 좋습니다.
    const fileName = path.basename(filePath); // 변수 선언 뒤에 세미콜론이 좋습니다.

    return { success: true, fileName, filePath }; // return 문 뒤에 세미콜론이 좋습니다.
});

// [ 기능 3 ] .stl 렌더링
ipcMain.handle('render-stl', async (event, filePath) => {
    try {
        const fileBuffer = fs.readFileSync(filePath); // 변수 선언 뒤에 세미콜론이 좋습니다.

        return fileBuffer; // return 문 뒤에 세미콜론이 좋습니다.
    } catch (e) {
        return { success: false, error: e.message }; // return 문 뒤에 세미콜론이 좋습니다.
    }
});

// [ 기능 4 ] custom alertBox
ipcMain.handle('showAlert', async (event, message) => {
    const options = {
        type: 'info',
        title: 'Inform',
        message: message
    }; // 객체 리터럴 선언 뒤에 세미콜론이 좋습니다.

    const result = await dialog.showMessageBox(mainWindow, options); // await 표현식 뒤에 세미콜론이 좋습니다.
    return result.response; // return 문 뒤에 세미콜론이 좋습니다.
});