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
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER NOT NULL,
                tooth_positions TEXT,
                diagnosis TEXT,
                treatment TEXT,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (patient_id) REFERENCES patients(id)
            );

            CREATE TABLE snippets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trigger TEXT UNIQUE NOT NULL,
                content TEXT NOT NULL,
                category TEXT
            );

            INSERT INTO patients (name, phone) VALUES ('样例病人', '13800000000');
            INSERT INTO snippets (trigger, content, category) VALUES 
                ('/xy', '洗牙+抛光+喷砂', 'common'),
                ('/ysy', '急性牙髓炎', 'diagnosis');
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
