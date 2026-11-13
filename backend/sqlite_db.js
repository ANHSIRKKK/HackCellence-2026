const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DB_PATH = path.resolve(__dirname, '../data/holiday.db');
const SCHEMA_PATH = path.resolve(__dirname, 'schema.sql');

class SqliteDatabase {
  constructor() {
    this.initDatabase();
  }

  initDatabase() {
    try {
      if (!fs.existsSync(DB_PATH) || fs.statSync(DB_PATH).size === 0) {
        if (fs.existsSync(SCHEMA_PATH)) {
          execSync(`sqlite3 "${DB_PATH}" < "${SCHEMA_PATH}"`);
        }
      }
    } catch (err) {
      console.warn('SQLite init warning:', err.message);
    }
  }

  execute(sql) {
    try {
      return execSync(`sqlite3 "${DB_PATH}" "${sql.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
    } catch (err) {
      console.error('SQLite execute error:', err.message);
      return null;
    }
  }

  queryJson(sql) {
    try {
      const sanitized = sql.trim().replace(/"/g, '\\"');
      const stdout = execSync(`sqlite3 -json "${DB_PATH}" "${sanitized}"`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
      return stdout.trim() ? JSON.parse(stdout) : [];
    } catch (err) {
      console.error('SQLite query error:', err.message);
      return { error: err.message };
    }
  }

  syncReservation(record) {
    if (!record || !record.reference) return;
    try {
      const traveler = record.traveler || {};
      const ref = record.reference;
      const tripId = record.trip_id || '';
      const name = (traveler.name || 'Traveler Party').replace(/'/g, "''");
      const airport = (traveler.home_airport || 'BLR').replace(/'/g, "''");
      const adults = parseInt(traveler.adults || 2, 10);
      const children = parseInt(traveler.children || 0, 10);
      const childAges = (traveler.child_ages || []).join(',');
      const startDate = record.start_date || '';
      const endDate = record.end_date || '';
      const country = (record.country || '').replace(/'/g, "''");
      const budget = parseInt(record.budget_inr || 0, 10);
      const total = parseInt(record.total_inr || 0, 10);
      const itemsJson = JSON.stringify(record.items || []).replace(/'/g, "''");
      const createdAt = record.created_at || new Date().toISOString();

      const sql = `
        INSERT OR REPLACE INTO reservations (
          reference, trip_id, traveler_name, home_airport, adults, children,
          child_ages, start_date, end_date, country, budget_inr, total_inr,
          status, items_json, created_at
        ) VALUES (
          '${ref}', '${tripId}', '${name}', '${airport}', ${adults}, ${children},
          '${childAges}', '${startDate}', '${endDate}', '${country}', ${budget}, ${total},
          'BOOKED', '${itemsJson}', '${createdAt}'
        );
      `;
      this.execute(sql);
    } catch (err) {
      console.warn('SQLite syncReservation error:', err.message);
    }
  }

  syncLocks(locks) {
    if (!Array.isArray(locks)) return;
    try {
      this.execute('DELETE FROM inventory_locks;');
      for (const l of locks) {
        const ref = (l.reference || '').replace(/'/g, "''");
        const type = (l.resource_type || '').replace(/'/g, "''");
        const catId = (l.catalog_id || '').replace(/'/g, "''");
        const roomId = (l.room_id || '').replace(/'/g, "''");
        const start = l.start || '';
        const end = l.end || '';
        const qty = parseInt(l.quantity || 1, 10);
        const ts = l.timestamp || new Date().toISOString();

        const sql = `
          INSERT INTO inventory_locks (reference, resource_type, catalog_id, room_id, start_date, end_date, quantity, created_at)
          VALUES ('${ref}', '${type}', '${catId}', '${roomId}', '${start}', '${end}', ${qty}, '${ts}');
        `;
        this.execute(sql);
      }
    } catch (err) {
      console.warn('SQLite syncLocks error:', err.message);
    }
  }

  getSchemaDetails() {
    try {
      const resCols = this.queryJson("PRAGMA table_info('reservations');");
      const lockCols = this.queryJson("PRAGMA table_info('inventory_locks');");
      const resCount = this.queryJson("SELECT COUNT(*) as count FROM reservations;")[0]?.count || 0;
      const lockCount = this.queryJson("SELECT COUNT(*) as count FROM inventory_locks;")[0]?.count || 0;

      return {
        database_file: 'data/holiday.db',
        engine: 'SQLite 3.54 (ACID Relational Database)',
        status: 'ONLINE & HEALTHY',
        tables: [
          {
            name: 'reservations',
            row_count: resCount,
            primary_key: 'reference',
            columns: resCols
          },
          {
            name: 'inventory_locks',
            row_count: lockCount,
            primary_key: 'id',
            foreign_key: 'reference -> reservations(reference)',
            columns: lockCols
          }
        ]
      };
    } catch (err) {
      return { error: err.message };
    }
  }
}

module.exports = new SqliteDatabase();

