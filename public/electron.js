const { BrowserWindow, app, ipcMain, dialog } = require("electron");
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const net = require('net');
const fs = require('fs');
const { spawn } = require('child_process');

const isDev = !app.isPackaged;
let mainWindow;
let serverProcesses = {};


function getPortAndIdByExeKey(exeName, exeList) {
    const temp = exeList.find(c => c.key === exeName);
    return temp ? { port: temp.port, id: temp.id } : null;
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        autoHideMenuBar: true,
        resizable: false,
        focusable: true,
        webPreferences: {
            preload: path.join(__dirname, "../preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
    });

    const entryURL = isDev
        ? "http://localhost:3000"
        : `file://${path.join(__dirname, "../build/index.html")}`;

    mainWindow.loadURL(entryURL)
        .catch(err => console.error("Failed to load URL:", err));
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("save-csv", async (event, jsonArray) => { // ipcMain.handle : render에서 invoke로 호출 가능한 비동기 함수를 등록하는 메소드.
    if (!Array.isArray(jsonArray) || jsonArray.length === 0) { // 데이터가 배열인지, 혹은 비어있는지 체크.
        return { success: false, error: "Invalid or empty data" };
    }

    const headers = Object.keys(jsonArray[0]); // keys만 추출
    const rows = jsonArray.map(obj => headers.map(key => obj[key])); // 추출한 key값들에 대한 value만 추출출

    // CSV 문자열 생성 (Excel 호환: UTF-8 BOM 추가)
    const csvContent = '\uFEFF' + [headers, ...rows].map(row => row.join(',')).join('\n'); // headers와 rows들을 배열 안에 담아서 2차원 배열로 만듬 > 각행을 ,단위로 한 문자열로 만듬 > \n으로 줄바꿈해서 문자열로 만듬

    // YYYY-MM-DD
    const dateStr = new Date().toISOString().split('T')[0]; // toISOString : 국제표준 날짜 문자열 / split : 해당 문자 기준으로 나누고 첫번째 요소만 추출.
    const filename = `${dateStr}_${uuidv4().slice(0, 8)}.csv`; // uuidv4 불특정한 숫자문자열에서 8번째까지 잘라서 사용용

    const { canceled, filePath } = await dialog.showSaveDialog({ // 저장 다이얼로그 창
        title: "CSV 파일 저장",
        defaultPath: path.join(app.getPath("downloads"), filename),
        filters: [{ name: "CSV Files", extensions: ["csv"] }],
    });

    if (canceled || !filePath) return { success: false };

    try {
        fs.writeFileSync(filePath, csvContent, "utf8"); // 파일쓰기 메소드.
        return { success: true, filePath };
    } catch (error) {
        console.error("파일 저장 실패: ", error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('select-and-start-server', async (event, exeList) => {
    // 1) .exe 파일 선택
    const { canceled, filePaths } = await dialog.showOpenDialog({
        title: '서버 실행용 .exe 선택',
        properties: ['openFile'],
        filters: [{ name: 'Executable', extensions: ['exe'] }],
    });
    if (canceled || !filePaths.length) {
        return { success: false, error: '파일 선택 취소' };
    }
    const exePath = filePaths[0];
    const fileName = path.basename(exePath);

    // 허용 목록에 있는지 체크
    const serverInfo = getPortAndIdByExeKey(fileName, exeList);
    if (serverInfo === null) {
        return { success: false, error: `허용되지 않은 파일입니다: ${fileName}` }
    }

    // 2) 이미 실행 중인지 확인
    const existing = serverProcesses[exePath];
    if (existing && !existing.killed) {
        return { success: false, error: '이미 실행 중인 서버입니다.', fileName, id: serverInfo.id, port: serverInfo.port };
    }

    // 3) 새 프로세스 실행 (콘솔 창 없이)
    try {
        const cp = spawn(exePath, [], {
            cwd: path.dirname(exePath),
            detached: true,          // 부모 프로세스와 분리
            stdio: 'ignore',         // stdin/stdout/stderr 모두 무시
            windowsHide: true,       // 콘솔 창 숨김
        });
        // 백그라운드 유지
        cp.unref();

        // 프로세스 종료 시 맵에서 제거
        cp.on('exit', () => {
            delete serverProcesses[exePath];
        });

        serverProcesses[exePath] = cp;

        return { success: true, fileName, exePath, id: serverInfo.id, port: serverInfo.port };
    } catch (err) {
        return { success: false, error: err.message, fileName };
    }
});

// [ 기능 2 ] .stl 파일명 / 파일 경로 리턴
ipcMain.handle("select-stl", async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        filters: [{ name: "STL Files", extensions: ["stl"] }],
        properties: ["openFile"]
    })

    if (canceled || filePaths.length === 0) return null;

    const filePath = filePaths[0];
    const fileName = path.basename(filePath);
    return { filePath, fileName };
});

// [ 기능 3 ] .stl 렌더링
ipcMain.handle("render-stl", async (event, filePath, fileName) => {
    const tempDir = isDev
        ? path.join(app.getAppPath(), "public/temp-stl")
        : path.join(app.getPath("userData"), "temp-stl");

    const tempPath = path.join(tempDir, fileName);

    try {
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        fs.copyFileSync(filePath, tempPath);

        const fileBuffer = fs.readFileSync(tempPath);

        return fileBuffer;

    } catch (e) {
        console.error(e);
        throw e;
    }
});

ipcMain.handle('show-dialog', async (event, arg) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);

    const options = {
        type: 'info',
        buttons: ['확인'],
        title: '알림',
        message: arg.message,
    };

    // 네이티브 알림창을 띄우고, 사용자의 선택(응답)을 기다립니다.
    const result = await dialog.showMessageBox(mainWindow, options);

    // 결과를 렌더러 프로세스로 반환합니다.
    return result.response;
});

ipcMain.handle('showAlert', async (event, message) => {
    const options = {
        type: 'info',
        title: '알림',
        message: message, // 렌더러에서 보낸 문자열 사용
        buttons: ['확인'],
    };
    // 다이얼로그를 띄우고 사용자가 버튼을 누르면 결과를 반환
    const result = await dialog.showMessageBox(mainWindow, options);
    return result.response;
});