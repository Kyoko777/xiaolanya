const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

const dbPath = path.join(os.homedir(), 'Library', 'Application Support', 'dental-manager', 'database.sqlite');
try {
  const db = new Database(dbPath);
  db.prepare('DELETE FROM patients').run();
  db.prepare('DELETE FROM records').run();
  console.log('Database cleared.');
  db.close();
} catch(e) {
  console.error(e.message);
}
