const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const AdmZip = require('adm-zip');

// --- 数据库与配置路径初始化 ---
const configPath = path.join(app.getPath('userData'), 'config.json');
let dbPath = path.join(app.getPath('userData'), 'dental.db');

// 加载自定义路径
if (fs.existsSync(configPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (config.dbPath && fs.existsSync(path.dirname(config.dbPath))) {
      dbPath = config.dbPath;
    }
  } catch (e) {
    console.error('Load config error:', e);
  }
}

let db = new Database(dbPath);

const initDb = (database) => {
  database.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    phone TEXT,
    id_number TEXT,
    address TEXT,
    product TEXT,
    warranty TEXT,
    attending_doctor TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY,
    patient_id TEXT,
    date TEXT,
    diagnosis TEXT,
    medical_history TEXT,
    special_exam TEXT,
    final_diagnosis TEXT,
    treatment TEXT,
    followups TEXT,
    selected_teeth TEXT,
    FOREIGN KEY(patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS snippets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    trigger TEXT,
    content TEXT,
    disease TEXT
  );
  `);

  // 自动迁移：为 snippets 添加 disease 字段
  try {
    database.exec("ALTER TABLE snippets ADD COLUMN disease TEXT;");
  } catch(e) {}
  try {
    database.exec("ALTER TABLE snippets ADD COLUMN trigger TEXT;");
  } catch(e) {}

  // 自动迁移：为旧数据库添加主治医生字段
  try {
    database.exec("ALTER TABLE patients ADD COLUMN attending_doctor TEXT;");
  } catch (e) {}

  // 数据恢复补丁：确保所有短语都有默认值，防止显示空白或保存失败
  try {
    database.exec("UPDATE snippets SET trigger = '/' || lower(category) WHERE trigger IS NULL;");
    database.exec("UPDATE snippets SET category = '通用' WHERE category IS NULL;");
    database.exec("UPDATE snippets SET disease = '通用' WHERE disease IS NULL;");
    database.exec("UPDATE snippets SET content = '未命名短语' WHERE content IS NULL;");
    console.log('--- 数据库数据修补成功: snippets ---');
  } catch(e) {
    console.error('Data patch error:', e);
  }
};

initDb(db);

console.log('--- 数据库已就绪: ' + dbPath + ' ---');

// --- IPC 处理器 ---

ipcMain.handle('db:get-patients', () => {
  return db.prepare('SELECT * FROM patients ORDER BY created_at DESC').all();
});

ipcMain.handle('db:get-doctors', () => {
  return db.prepare('SELECT * FROM doctors ORDER BY created_at ASC').all();
});

ipcMain.handle('db:save-doctor', (event, doctor) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO doctors (id, name, title, avatar_url)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name=excluded.name,
        title=excluded.title,
        avatar_url=excluded.avatar_url
    `);
    stmt.run(doctor.id, doctor.name, doctor.title || '', doctor.avatar_url || '');
    return { success: true };
  } catch (err) {
    console.error('Save Doctor Error:', err);
    throw err;
  }
});

ipcMain.handle('db:delete-doctor', (event, id) => {
  db.prepare('DELETE FROM doctors WHERE id = ?').run(id);
  return { success: true };
});

ipcMain.handle('db:save-patient', (event, patient) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO patients (id, name, age, gender, phone, id_number, address, product, warranty, attending_doctor)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name=excluded.name,
        age=excluded.age,
        gender=excluded.gender,
        phone=excluded.phone,
        id_number=excluded.id_number,
        address=excluded.address,
        product=excluded.product,
        warranty=excluded.warranty,
        attending_doctor=excluded.attending_doctor
    `);
    stmt.run(
      patient.id, 
      patient.name || '无名', 
      parseInt(patient.age) || 0, 
      patient.gender || '男', 
      patient.phone || '', 
      patient.id_number || '', 
      patient.address || '', 
      patient.product || '', 
      patient.warranty || '',
      patient.attending_doctor || ''
    );
    return { success: true };
  } catch (err) {
    console.error('Database Save Patient Error:', err);
    throw err;
  }
});

ipcMain.handle('db:delete-patient', (event, id) => {
  try {
    const transaction = db.transaction(() => {
      db.prepare('DELETE FROM records WHERE patient_id = ?').run(id);
      db.prepare('DELETE FROM patients WHERE id = ?').run(id);
    });
    transaction();
    return { success: true };
  } catch (err) {
    console.error('Delete Patient Error:', err);
    throw err;
  }
});

ipcMain.handle('db:get-snippets', () => {
  return db.prepare('SELECT * FROM snippets').all();
});

ipcMain.handle('db:add-snippet', (event, { trigger, content, category, disease }) => {
  try {
    const stmt = db.prepare('INSERT INTO snippets (trigger, content, category, disease) VALUES (?, ?, ?, ?)');
    stmt.run(trigger, content, category, disease);
    return { success: true };
  } catch (err) {
    console.error('Add Snippet Error:', err);
    throw err;
  }
});

ipcMain.handle('db:update-snippet', (event, { id, trigger, content, category, disease }) => {
  try {
    const stmt = db.prepare('UPDATE snippets SET trigger = ?, content = ?, category = ?, disease = ? WHERE id = ?');
    stmt.run(trigger, content, category, disease, id);
    return { success: true };
  } catch (err) {
    console.error('Update Snippet Error:', err);
    throw err;
  }
});

ipcMain.handle('db:delete-snippet', (event, id) => {
  try {
    const stmt = db.prepare('DELETE FROM snippets WHERE id = ?');
    stmt.run(id);
    return { success: true };
  } catch (err) {
    console.error('Delete Snippet Error:', err);
    throw err;
  }
});

ipcMain.handle('db:get-records', (event, patientId) => {
  return db.prepare('SELECT * FROM records WHERE patient_id = ? ORDER BY date DESC').all(patientId);
});

ipcMain.handle('db:get-storage-path', () => {
  return dbPath;
});

ipcMain.handle('db:set-storage-path', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    const newDirPath = result.filePaths[0];
    const newDbPath = path.join(newDirPath, 'dental.db');
    
    // 如果目标路径已有数据库，询问是否覆盖或加载
    if (fs.existsSync(newDbPath)) {
      const choice = dialog.showMessageBoxSync({
        type: 'question',
        buttons: ['使用已有数据库', '覆盖它', '取消'],
        title: '路径已存在数据库',
        message: '所选路径已有一个数据库文件，您想如何操作？'
      });
      if (choice === 2) return null;
      if (choice === 1) fs.copyFileSync(dbPath, newDbPath);
    } else {
      // 迁移当前数据
      fs.copyFileSync(dbPath, newDbPath);
    }
    
    // 更新配置
    dbPath = newDbPath;
    fs.writeFileSync(configPath, JSON.stringify({ dbPath }));
    
    // 重连数据库
    db.close();
    db = new Database(dbPath);
    initDb(db);
    
    return dbPath;
  }
  return null;
});

ipcMain.handle('db:export-data', async (event, { startDate, endDate }) => {
  const result = await dialog.showSaveDialog({
    title: '导出病历数据',
    defaultPath: `病历备份_${startDate}_至_${endDate}.zip`,
    filters: [{ name: 'Zip Archives', extensions: ['zip'] }]
  });

  if (!result.canceled && result.filePath) {
    try {
      const patients = db.prepare('SELECT * FROM patients').all();
      const doctors = db.prepare('SELECT * FROM doctors').all();
      const records = db.prepare('SELECT * FROM records WHERE date >= ? AND date <= ?').all(startDate, endDate);
      const snippets = db.prepare('SELECT * FROM snippets').all();

      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        range: { startDate, endDate },
        data: { patients, doctors, records, snippets }
      };

      const zip = new AdmZip();
      zip.addFile('data.json', Buffer.from(JSON.stringify(exportData, null, 2), 'utf8'));
      
      // 可以添加一个简单的说明文档，方便手机查看
      const readme = `小蓝牙病历备份文件\n时间范围: ${startDate} 至 ${endDate}\n导出时间: ${new Date().toLocaleString()}\n包含患者数: ${patients.length}\n包含病历数: ${records.length}`;
      zip.addFile('README.txt', Buffer.from(readme, 'utf8'));
      
      zip.writeZip(result.filePath);
      return { success: true, path: result.filePath };
    } catch (err) {
      console.error('Export error:', err);
      return { success: false, error: err.message };
    }
  }
  return null;
});

ipcMain.handle('db:import-data', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Zip Archives', extensions: ['zip'] }]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    try {
      const zip = new AdmZip(result.filePaths[0]);
      const zipEntries = zip.getEntries();
      const dataEntry = zipEntries.find(e => e.entryName === 'data.json');
      
      if (!dataEntry) throw new Error('无效的备份文件：找不到 data.json');
      
      const importData = JSON.parse(dataEntry.getData().toString('utf8'));
      const { patients, doctors, records, snippets } = importData.data;

      // 使用事务批量导入
      const transaction = db.transaction(() => {
        if (doctors) {
          const stmt = db.prepare('INSERT OR REPLACE INTO doctors (id, name, title, avatar_url) VALUES (?, ?, ?, ?)');
          doctors.forEach(d => stmt.run(d.id, d.name, d.title, d.avatar_url));
        }
        if (patients) {
          const stmt = db.prepare('INSERT OR REPLACE INTO patients (id, name, age, gender, phone, id_number, address, product, warranty, attending_doctor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
          patients.forEach(p => stmt.run(p.id, p.name, p.age, p.gender, p.phone, p.id_number, p.address, p.product, p.warranty, p.attending_doctor));
        }
        if (records) {
          const stmt = db.prepare('INSERT OR REPLACE INTO records (id, patient_id, date, diagnosis, medical_history, special_exam, final_diagnosis, treatment, followups, selected_teeth) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
          records.forEach(r => stmt.run(r.id, r.patient_id, r.date, r.diagnosis, r.medical_history, r.special_exam, r.final_diagnosis, r.treatment, r.followups, r.selected_teeth));
        }
        if (snippets) {
          const stmt = db.prepare('INSERT OR REPLACE INTO snippets (id, category, content) VALUES (?, ?, ?)');
          snippets.forEach(s => stmt.run(s.id, s.category, s.content));
        }
      });
      transaction();

      return { success: true, count: records?.length || 0 };
    } catch (err) {
      console.error('Import error:', err);
      return { success: false, error: err.message };
    }
  }
  return null;
});

ipcMain.handle('db:save-record', (event, record) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO records (id, patient_id, date, diagnosis, medical_history, special_exam, final_diagnosis, treatment, followups, selected_teeth)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        date=excluded.date,
        diagnosis=excluded.diagnosis,
        medical_history=excluded.medical_history,
        special_exam=excluded.special_exam,
        final_diagnosis=excluded.final_diagnosis,
        treatment=excluded.treatment,
        followups=excluded.followups,
        selected_teeth=excluded.selected_teeth
    `);
    stmt.run(
      record.id, 
      record.patient_id, 
      record.date || '', 
      record.diagnosis || '', 
      record.medicalHistory || '', 
      record.specialExam || '', 
      record.finalDiagnosis || '', 
      record.treatment || '', 
      JSON.stringify(record.followups || []),
      JSON.stringify(record.selectedTeeth || [])
    );
    return { success: true };
  } catch (err) {
    console.error('Database Save Record Error:', err);
    throw err;
  }
});

ipcMain.handle('pdf:export', async (event, { patient, record }) => {
  const pdfPath = await dialog.showSaveDialog({
    title: '导出病历 PDF',
    defaultPath: path.join(app.getPath('downloads'), `${patient.name}_病历_${record.date.replace(/\//g, '-')}.pdf`),
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
  });

  if (pdfPath.canceled) return { success: false };

  const printWin = new BrowserWindow({ show: false });
  
  // Parse JSON data
  const selectedTeeth = JSON.parse(record.selected_teeth || '[]');
  const followups = JSON.parse(record.followups || '[]');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @page { size: A4; margin: 2cm; }
        body { 
          font-family: "PingFang SC", "STHeiti", "Microsoft YaHei", sans-serif; 
          color: #1a1a1a;
          line-height: 1.6;
          margin: 0;
          padding: 0;
        }
        .container { padding: 0; }
        .header { 
          text-align: center; 
          margin-bottom: 40px; 
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .clinic-name { font-size: 28px; font-weight: 800; letter-spacing: 2px; margin-bottom: 5px; }
        .doc-title { font-size: 18px; color: #666; font-weight: 500; }
        
        .patient-info { 
          display: grid; 
          grid-template-cols: repeat(4, 1fr); 
          gap: 15px;
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          font-size: 14px;
        }
        .info-item b { color: #555; margin-right: 5px; }
        
        .section { margin-bottom: 25px; page-break-inside: avoid; }
        .section-title { 
          font-size: 15px; 
          font-weight: 800; 
          color: #000;
          border-left: 4px solid #333;
          padding-left: 10px;
          margin-bottom: 10px;
          background: #f0f0f0;
          padding-top: 5px;
          padding-bottom: 5px;
        }
        .section-content { 
          font-size: 14px; 
          padding: 5px 15px;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .teeth-tag {
          display: inline-block;
          background: #333;
          color: #fff;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          margin-right: 5px;
          margin-bottom: 5px;
        }
        .followup-box {
          border-top: 1px dashed #ccc;
          padding-top: 15px;
          margin-top: 15px;
        }
        .footer {
          margin-top: 50px;
          display: flex;
          justify-content: space-between;
          border-top: 1px solid #eee;
          padding-top: 20px;
          font-size: 12px;
          color: #888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="clinic-name">口腔临床病历记录</div>
          <div class="doc-title">Clinical Dental Record</div>
        </div>

        <div class="patient-info">
          <div class="info-item"><b>姓名:</b> ${patient.name}</div>
          <div class="info-item"><b>性别:</b> ${patient.gender || '/'}</div>
          <div class="info-item"><b>年龄:</b> ${patient.age || '/'}岁</div>
          <div class="info-item"><b>就诊日期:</b> ${record.date}</div>
          <div class="info-item" style="grid-column: span 2"><b>联系电话:</b> ${patient.phone || '/'}</div>
          <div class="info-item" style="grid-column: span 2"><b>档案编号:</b> ${patient.id_number || '/'}</div>
        </div>

        <div class="section">
          <div class="section-title">主诉 / Chief Complaint</div>
          <div class="section-content">${record.diagnosis || '无'}</div>
        </div>

        <div class="section">
          <div class="section-title">现病史及既往史 / History</div>
          <div class="section-content">${record.medical_history || '无'}</div>
        </div>

        <div class="section">
          <div class="section-title">专科检查 / Clinical Examination</div>
          <div class="section-content">
            ${selectedTeeth.length > 0 ? `<div><b>涉及牙位:</b> ${selectedTeeth.map(t => `<span class="teeth-tag">${t}</span>`).join('')}</div><br>` : ''}
            ${record.special_exam || '未见异常'}
          </div>
        </div>

        <div class="section">
          <div class="section-title">诊断结果 / Diagnosis</div>
          <div class="section-content">${record.final_diagnosis || '未录入'}</div>
        </div>

        <div class="section">
          <div class="section-title">治疗方案与医嘱 / Treatment Plan & Advice</div>
          <div class="section-content">${record.treatment || '无'}</div>
        </div>

        ${followups.length > 0 ? `
        <div class="section">
          <div class="section-title">复诊记录 / Follow-up Records</div>
          <div class="section-content">
            ${followups.map((f, i) => `
              <div class="followup-box">
                <b>第 ${i+1} 次复诊记录:</b><br>
                ${f}
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <div class="footer">
          <div>打印时间: ${new Date().toLocaleString()}</div>
          <div>医生签名: ____________________</div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
    const data = await printWin.webContents.printToPDF({
      margins: { marginType: 'none' },
      printBackground: true,
      pageSize: 'A4',
      landscape: false
    });
    fs.writeFileSync(pdfPath.filePath, data);
    printWin.close();
    return { success: true, filePath: pdfPath.filePath };
  } catch (error) {
    console.error('PDF Export Error:', error);
    if (!printWin.isDestroyed()) printWin.close();
    return { success: false, error: error.message };
  }
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

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '../out/index.html'));
  } else {
    win.loadURL('http://localhost:3002');
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
