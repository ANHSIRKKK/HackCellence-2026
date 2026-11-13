const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE = path.resolve(__dirname, '../data/reservations.json');
const LOCKS_FILE = path.resolve(__dirname, '../data/inventory_locks.json');

class StorageService {
  constructor() {
    this.reservations = new Map(); // reference -> reservation doc
    this.inventoryLocks = []; // array of lock records
    this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        for (const item of data) {
          if (item && item.reference) {
            this.reservations.set(item.reference, item);
          }
        }
      } else {
        fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf8');
      }
    } catch (err) {
      console.error('Error loading reservations:', err);
    }

    try {
      if (fs.existsSync(LOCKS_FILE)) {
        this.inventoryLocks = JSON.parse(fs.readFileSync(LOCKS_FILE, 'utf8'));
      } else {
        fs.writeFileSync(LOCKS_FILE, JSON.stringify([], null, 2), 'utf8');
      }
    } catch (err) {
      console.error('Error loading inventory locks:', err);
    }
  }

  saveData() {
    try {
      const arr = Array.from(this.reservations.values());
      fs.writeFileSync(DB_FILE, JSON.stringify(arr, null, 2), 'utf8');
      fs.writeFileSync(LOCKS_FILE, JSON.stringify(this.inventoryLocks, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving storage:', err);
    }
  }

  generateReference() {
    // Generate unique 10-digit reservation number
    let ref = '';
    do {
      ref = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    } while (this.reservations.has(ref));
    return ref;
  }

  createReservation(tripData) {
    const reference = this.generateReference();
    const now = new Date().toISOString();

    // Mark trip as booked
    const bookedTrip = JSON.parse(JSON.stringify(tripData));
    bookedTrip.status = 'BOOKED';
    bookedTrip.booking = { reference };

    for (const item of bookedTrip.items) {
      item.status = 'BOOKED';
      item.booking = { reference };
    }

    // Apply inventory locks (Feature S2)
    for (const item of bookedTrip.items) {
      if (item.type === 'flight') {
        this.inventoryLocks.push({
          reference,
          resource_type: 'FLIGHT',
          catalog_id: item.catalog_id,
          quantity: item.quantity,
          timestamp: now
        });
      } else if (item.type === 'hotel') {
        this.inventoryLocks.push({
          reference,
          resource_type: 'ROOM',
          room_id: item.room_id,
          catalog_id: item.catalog_id,
          start: item.start,
          end: item.end,
          quantity: item.quantity,
          timestamp: now
        });
      }
    }

    const record = {
      reference,
      trip_id: bookedTrip.trip_id,
      traveler: bookedTrip.traveler,
      country: bookedTrip.country,
      start_date: bookedTrip.start_date,
      end_date: bookedTrip.end_date,
      budget_inr: bookedTrip.budget_inr,
      total_inr: bookedTrip.total_inr,
      items: bookedTrip.items,
      created_at: now
    };

    this.reservations.set(reference, record);
    this.saveData();

    return record;
  }

  getReservation(reference) {
    if (!reference) return null;
    return this.reservations.get(reference.toString().trim()) || null;
  }

  getAllReservations() {
    return Array.from(this.reservations.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  getLockedSeats(flightId) {
    return this.inventoryLocks
      .filter(l => l.resource_type === 'FLIGHT' && l.catalog_id === flightId)
      .reduce((sum, l) => sum + l.quantity, 0);
  }

  getLockedRooms(roomId, dateStr) {
    return this.inventoryLocks
      .filter(l => {
        if (l.resource_type !== 'ROOM' || l.room_id !== roomId) return false;
        return dateStr >= l.start && dateStr < l.end;
      })
      .reduce((sum, l) => sum + l.quantity, 0);
  }
}

module.exports = new StorageService();

