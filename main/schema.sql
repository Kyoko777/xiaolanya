-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    gender TEXT,
    birth_date TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Records table
CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    tooth_positions TEXT, -- JSON array of teeth involved (e.g., ["18", "47"])
    diagnosis TEXT,
    treatment TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Snippets (Slash Commands) table
CREATE TABLE IF NOT EXISTS snippets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trigger TEXT UNIQUE NOT NULL, -- e.g., "/xb"
    content TEXT NOT NULL,         -- e.g., "洗牙+全口检查"
    category TEXT
);

-- Initial data for snippets
INSERT OR IGNORE INTO snippets (trigger, content, category) VALUES 
('/xy', '洗牙+抛光+喷砂', 'common'),
('/kqjc', '全口口腔内窥镜检查', 'common'),
('/拔牙', '局部浸润麻醉下行患牙拔除术', 'surgery');
