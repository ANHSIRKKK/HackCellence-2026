const fs = require('fs');
const path = require('path');

const CATALOG_DIR = path.resolve(__dirname, '../data/catalog');

class CatalogService {
  constructor() {
    this.destinations = null;
    this.airports = [];
    this.flights = [];
    this.hotels = [];
    this.rooms = [];
    this.availability = [];
    this.transfers = [];
    this.attractions = [];

    // Indices for fast lookups
    this.airportsMap = new Map();
    this.hotelsMap = new Map();
    this.hotelsByCity = new Map();
    this.roomsMap = new Map();
    this.roomsByHotel = new Map();
    this.availabilityMap = new Map(); // key: `${room_id}_${date}` -> rooms_left
    this.outboundFlights = new Map(); // key: `${from}_${date}` -> [flights]
    this.inboundFlights = new Map();  // key: `${to}_${date}` -> [flights]
    this.transfersAirportMap = new Map(); // key: `${airport}_${city}` -> [transfers]
    this.transfersIntercityMap = new Map(); // key: `${from_city}_${to_city}` -> [transfers]
    this.attractionsByCity = new Map();
    this.attractionsMap = new Map();

    this.loadCatalog();
  }

  loadCatalog() {
    this.destinations = JSON.parse(fs.readFileSync(path.join(CATALOG_DIR, 'destinations.json'), 'utf8'));
    this.airports = JSON.parse(fs.readFileSync(path.join(CATALOG_DIR, 'airports.json'), 'utf8'));
    this.flights = JSON.parse(fs.readFileSync(path.join(CATALOG_DIR, 'flights.json'), 'utf8'));
    this.hotels = JSON.parse(fs.readFileSync(path.join(CATALOG_DIR, 'hotels.json'), 'utf8'));
    this.rooms = JSON.parse(fs.readFileSync(path.join(CATALOG_DIR, 'rooms.json'), 'utf8'));
    this.availability = JSON.parse(fs.readFileSync(path.join(CATALOG_DIR, 'availability.json'), 'utf8'));
    this.transfers = JSON.parse(fs.readFileSync(path.join(CATALOG_DIR, 'transfers.json'), 'utf8'));
    this.attractions = JSON.parse(fs.readFileSync(path.join(CATALOG_DIR, 'attractions.json'), 'utf8'));

    // Index airports
    for (const apt of this.airports) {
      this.airportsMap.set(apt.code, apt);
    }

    // Index hotels
    for (const h of this.hotels) {
      this.hotelsMap.set(h.hotel_id, h);
      if (!this.hotelsByCity.has(h.city)) {
        this.hotelsByCity.set(h.city, []);
      }
      this.hotelsByCity.get(h.city).push(h);
    }

    // Index rooms
    for (const r of this.rooms) {
      this.roomsMap.set(r.room_id, r);
      if (!this.roomsByHotel.has(r.hotel_id)) {
        this.roomsByHotel.set(r.hotel_id, []);
      }
      this.roomsByHotel.get(r.hotel_id).push(r);
    }

    // Index availability
    for (const av of this.availability) {
      this.availabilityMap.set(`${av.room_id}_${av.date}`, av.rooms_left);
    }

    // Index flights
    for (const fl of this.flights) {
      // Outbound arrival local date
      const arrDate = fl.arrival_local.split('T')[0];
      const depDate = fl.departure_local.split('T')[0];

      // Index by from + arrDate (for outbound)
      const outKey = `${fl.from}_${arrDate}`;
      if (!this.outboundFlights.has(outKey)) {
        this.outboundFlights.set(outKey, []);
      }
      this.outboundFlights.get(outKey).push(fl);

      // Index by to + depDate (for inbound return flight departure date)
      const inKey = `${fl.to}_${depDate}`;
      if (!this.inboundFlights.has(inKey)) {
        this.inboundFlights.set(inKey, []);
      }
      this.inboundFlights.get(inKey).push(fl);
    }

    // Index transfers
    for (const tr of this.transfers) {
      if (tr.airport && tr.city) {
        const key = `${tr.airport}_${tr.city}`;
        if (!this.transfersAirportMap.has(key)) {
          this.transfersAirportMap.set(key, []);
        }
        this.transfersAirportMap.get(key).push(tr);
      }
      if (tr.from_city && tr.to_city) {
        const key = `${tr.from_city}_${tr.to_city}`;
        if (!this.transfersIntercityMap.has(key)) {
          this.transfersIntercityMap.set(key, []);
        }
        this.transfersIntercityMap.get(key).push(tr);
      }
    }

    // Index attractions (filter out cities with no hotels like Nara)
    for (const att of this.attractions) {
      this.attractionsMap.set(att.attraction_id, att);
      if (this.hotelsByCity.has(att.city)) {
        if (!this.attractionsByCity.has(att.city)) {
          this.attractionsByCity.set(att.city, []);
        }
        this.attractionsByCity.get(att.city).push(att);
      }
    }
  }

  getAirportsServingCity(city) {
    const list = [];
    for (const apt of this.airports) {
      if (apt.serves_cities && apt.serves_cities.includes(city)) {
        list.push(apt.code);
      }
    }
    return list;
  }

  getRoomAvailability(roomId, date) {
    const key = `${roomId}_${date}`;
    return this.availabilityMap.has(key) ? this.availabilityMap.get(key) : 0;
  }
}

module.exports = new CatalogService();
