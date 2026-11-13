const sqliteDb = require('../backend/sqlite_db');

console.log('========================================================================================');
console.log('🏛️  ENTERPRISE SQLITE RELATIONAL DATABASE INSPECTOR');
console.log('📍 File: data/holiday.db · Engine: SQLite 3 (ACID Relational Storage)');
console.log('========================================================================================\n');

const details = sqliteDb.getSchemaDetails();
console.log(`STATUS: ${details.status}`);
console.log(`TABLES DETECTED: ${details.tables.map(t => `${t.name} (${t.row_count} rows)`).join(', ')}\n`);

console.log('--- [TABLE: reservations] ---');
const reservations = sqliteDb.queryJson('SELECT reference, traveler_name, country, budget_inr, total_inr, created_at FROM reservations;');
if (Array.isArray(reservations) && reservations.length > 0) {
  console.table(reservations);
} else {
  console.log('No reservations found.');
}

console.log('\n--- [TABLE: inventory_locks (Double-Booking Prevention)] ---');
const locks = sqliteDb.queryJson('SELECT id, reference, resource_type, catalog_id, room_id, quantity, created_at FROM inventory_locks LIMIT 15;');
if (Array.isArray(locks) && locks.length > 0) {
  console.table(locks);
} else {
  console.log('No active inventory locks found.');
}

console.log('\n========================================================================================');
console.log('Interactive Shell Command: sqlite3 data/holiday.db');
console.log('========================================================================================');
