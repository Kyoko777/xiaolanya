const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./db');
const isDev = !app.isPackaged;

// --- 数据库 IPC 处理器 ---

ipcMain.handle('db:get-patients', () => {
  return db.prepare('SELECT * FROM patients ORDER BY created_at DESC').all();
});

ipcMain.handle('db:get-snippets', () => {
  return db.prepare('SELECT * FROM snippets').all();
});

ipcMain.handle('db:add-snippet', (_, { trigger, content, category }) => {
  const info = db.prepare('INSERT INTO snippets (trigger, content, category) VALUES (?, ?, ?)').run(trigger, content, category);
  return info.lastInsertRowid;
});

ipcMain.handle('db:update-snippet', (_, { id, trigger, content }) => {
  return db.prepare('UPDATE snippets SET trigger = ?, content = ? WHERE id = ?').run(trigger, content, id);
});

ipcMain.handle('db:delete-snippet', (_, id) => {
  return db.prepare('DELETE FROM snippets WHERE id = ?').run(id);
});

// 【核心新增】更新患者详细档案
ipcMain.handle('db:update-patient-profile', (_, { id, name, phone, gender, age, project, product, warranty }) => {
  return db.prepare(`
    UPDATE patients 
    SET name = ?, phone = ?, gender = ?, age = ?, project = ?, product = ?, warranty = ? 
    WHERE id = ?
  `).run(name, phone, gender, age, project, product, warranty, id);
});

ipcMain.handle('db:save-record', (_, { patientId, toothPositions, diagnosis, treatment, notes }) => {
  const stmt = db.prepare('INSERT INTO records (patient_id, tooth_positions, diagnosis, treatment, notes) VALUES (?, ?, ?, ?, ?)');
  const info = stmt.run(patientId, JSON.stringify(toothPositions), diagnosis, treatment, notes);
  return info.lastInsertRowid;
});

ipcMain.handle('db:get-latest-record', (_, patientId) => {
  const row = db.prepare('SELECT * FROM records WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1').get(patientId);
  if (row && row.tooth_positions) {
    try {
      row.tooth_positions = JSON.parse(row.tooth_positions);
    } catch (e) {
      row.tooth_positions = [];
    }
  }
  return row;
});

ipcMain.on('db:refresh-patients', (event) => {
  event.sender.send('db:refresh-patients');
});

// --- 窗口管理 ---

function createWindow() {
  const win = new BrowserWindow({
    width: 1300,
    height: 900,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const url = isDev ? 'http://localhost:3001' : `file://${path.join(__dirname, '../out/index.html')}`;
  win.loadURL(url);

  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
