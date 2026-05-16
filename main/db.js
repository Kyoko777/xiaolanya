const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'dental_final_v1.db'); 

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = OFF');

const initDb = () => {
    // 检查表是否已经存在，避免重复删除导致外键冲突
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='patients'").get();
    
    if (tableExists) {
        console.log('--- 数据库已存在，系统就绪 ---');
        // 动态增加 disease 字段（如果不存在）
        try {
            const columns = db.prepare("PRAGMA table_info(snippets)").all();
            const hasDisease = columns.some(col => col.name === 'disease');
            if (!hasDisease) {
                db.exec("ALTER TABLE snippets ADD COLUMN disease TEXT DEFAULT '通用'");
                console.log('--- 已为 snippets 表增加 disease 字段 ---');
            }

            // 升级 patients 表
            const patientCols = db.prepare("PRAGMA table_info(patients)").all();
            const colNames = patientCols.map(c => c.name);
            const missing = ['gender', 'age', 'project', 'product', 'warranty'].filter(c => !colNames.includes(c));
            
            missing.forEach(col => {
                db.exec(`ALTER TABLE patients ADD COLUMN ${col} TEXT`);
                console.log(`--- 已为 patients 表增加 ${col} 字段 ---`);
            });

            // 升级 records 表
            const recordCols = db.prepare("PRAGMA table_info(records)").all();
            const hasFinalDiagnosis = recordCols.some(col => col.name === 'final_diagnosis');
            if (!hasFinalDiagnosis) {
                db.exec("ALTER TABLE records ADD COLUMN final_diagnosis TEXT");
                console.log('--- 已为 records 表增加 final_diagnosis 字段 ---');
            }
        } catch (e) {
            console.error('升级数据库失败:', e);
        }
        db.pragma('foreign_keys = ON');
        return;
    }

    console.log('--- 正在进行数据库首次初始化 ---');
    try {
        db.exec(`
            CREATE TABLE patients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT,
                gender TEXT,
                age TEXT,
                project TEXT,
                product TEXT,
                warranty TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER NOT NULL,
                tooth_positions TEXT,
                diagnosis TEXT,
                treatment TEXT,
                final_diagnosis TEXT,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (patient_id) REFERENCES patients(id)
            );

            CREATE TABLE snippets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trigger TEXT UNIQUE NOT NULL,
                content TEXT NOT NULL,
                category TEXT,
                disease TEXT DEFAULT '通用'
            );

            INSERT INTO patients (name, phone) VALUES ('样例病人', '13800000000');
            INSERT INTO snippets (trigger, content, category, disease) VALUES 
                ('/xy', '洗牙+抛光+喷砂', '处置', '通用'),
                ('/ysy', '急性牙髓炎', '诊断', '牙体牙髓');
        `);
        console.log('--- 数据库初始化成功 ---');
    } catch (err) {
        console.error('--- 数据库初始化失败 ---', err);
    } finally {
        db.pragma('foreign_keys = ON');
    }
};

initDb();

module.exports = db;
