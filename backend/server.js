const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const catalog = require('./catalog');
const storage = require('./storage');
const planner = require('./planner');
const validator = require('./validator');
const nlp = require('./nlp');

const PORT = process.env.PORT || 5001;
const FRONTEND_DIR = path.resolve(__dirname, '../frontend');
const IMAGES_DIR = path.resolve(__dirname, '../images');

// In-memory active trips store (for staging modifications)
const activeTripsCache = new Map();

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJson(res, statusCode, data) {
  setCorsHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File Not Found');
    } else {
      setCorsHeaders(res);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
}

function getContentType(ext) {
  switch (ext.toLowerCase()) {
    case '.html': return 'text/html';
    case '.css': return 'text/css';
    case '.js': 
    case '.jsx':
    case '.ts':
    case '.tsx': return 'application/javascript';
    case '.json': return 'application/json';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.png': return 'image/png';
    case '.svg': return 'image/svg+xml';
    default: return 'application/octet-stream';
  }
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', err => reject(err));
  });
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  try {
    // SECTION 8 REST APIs:

    // 1. GET /api/catalog/destinations
    if (req.method === 'GET' && (pathname === '/api/catalog/destinations' || pathname === '/api/catalog/metadata')) {
      return sendJson(res, 200, {
        departure_cities: catalog.destinations.departure_cities,
        countries: catalog.destinations.countries.map(c => ({
          code: c.code,
          name: c.name,
          timezone: c.timezone,
          cities: c.cities.map(ct => ct.name)
        })),
        rules: catalog.destinations.rules
      });
    }

    // 2. GET /api/catalog/options
    if (req.method === 'GET' && pathname === '/api/catalog/options') {
      return sendJson(res, 200, {
        destinations: catalog.destinations,
        airports: catalog.airports,
        hotelsCount: catalog.hotels.length,
        attractionsCount: catalog.attractions.length
      });
    }

    // 2a. GET /api/catalog/flights
    if (req.method === 'GET' && pathname === '/api/catalog/flights') {
      let results = catalog.flights;
      if (query.from) {
        results = results.filter(f => f.from.toLowerCase() === query.from.toLowerCase());
      }
      if (query.to) {
        results = results.filter(f => f.to.toLowerCase() === query.to.toLowerCase());
      }
      if (query.airline) {
        results = results.filter(f => f.airline.toLowerCase().includes(query.airline.toLowerCase()));
      }
      if (query.cabin) {
        results = results.filter(f => f.cabin.toLowerCase() === query.cabin.toLowerCase());
      }
      return sendJson(res, 200, { success: true, count: results.length, flights: results.slice(0, 60) });
    }

    // 2b. GET /api/catalog/attractions
    if (req.method === 'GET' && pathname === '/api/catalog/attractions') {
      let results = catalog.attractions;
      if (query.city) {
        results = results.filter(a => a.city.toLowerCase() === query.city.toLowerCase());
      }
      if (query.category) {
        results = results.filter(a => a.category.toLowerCase() === query.category.toLowerCase());
      }
      return sendJson(res, 200, { success: true, count: results.length, attractions: results });
    }

    // 2c. GET /api/catalog/hotels
    if (req.method === 'GET' && pathname === '/api/catalog/hotels') {
      let results = catalog.hotels;
      if (query.city) {
        results = results.filter(h => h.city.toLowerCase() === query.city.toLowerCase());
      }
      return sendJson(res, 200, { success: true, count: results.length, hotels: results });
    }

    // 2d. GET /api/catalog/transfers
    if (req.method === 'GET' && pathname === '/api/catalog/transfers') {
      let results = catalog.transfers;
      if (query.city) {
        results = results.filter(t => (t.city && t.city.toLowerCase() === query.city.toLowerCase()) || (t.to_city && t.to_city.toLowerCase() === query.city.toLowerCase()));
      }
      return sendJson(res, 200, { success: true, count: results.length, transfers: results });
    }

    // 3. POST /api/trips/validate-request
    if (req.method === 'POST' && pathname === '/api/trips/validate-request') {
      const body = await parseBody(req);
      // Validate mandatory fields
      const errors = [];
      if (!body.departureCity) errors.push('departureCity is required');
      if (!body.destinationCountry) errors.push('destinationCountry is required');
      if (!body.startDate) errors.push('startDate is required');
      if (!body.nights || body.nights < 3 || body.nights > 10) errors.push('nights must be between 3 and 10');
      if (!body.adults || body.adults < 1) errors.push('at least 1 adult is required');
      if (!body.budget || body.budget <= 0) errors.push('positive budget is required');

      // Normalize preference weights to 100%
      let prefs = body.preferences || { hotelWeight: 40, flightWeight: 30, experienceWeight: 30 };
      const sum = (prefs.hotelWeight || 0) + (prefs.flightWeight || 0) + (prefs.experienceWeight || 0);
      if (sum > 0) {
        prefs.hotelWeight = Math.round((prefs.hotelWeight / sum) * 100);
        prefs.flightWeight = Math.round((prefs.flightWeight / sum) * 100);
        prefs.experienceWeight = 100 - prefs.hotelWeight - prefs.flightWeight;
      }

      return sendJson(res, 200, {
        valid: errors.length === 0,
        errors,
        normalizedPreferences: prefs
      });
    }

    // 4. POST /api/trips/generate & /api/packages/generate
    if (req.method === 'POST' && (pathname === '/api/trips/generate' || pathname === '/api/packages/generate')) {
      const body = await parseBody(req);
      const normalizedRequest = {
        departure_city: body.departure_city || body.departureCity,
        country: body.country || body.destinationCountry,
        start_date: body.start_date || body.startDate,
        nights: parseInt(body.nights || 6, 10),
        adults: parseInt(body.adults || 2, 10),
        children: parseInt(body.children !== undefined ? body.children : (body.childrenAges ? body.childrenAges.length : 0), 10),
        child_ages: body.child_ages || body.childrenAges || [],
        budget: parseInt(body.budget || 350000, 10),
        traveler_name: body.traveler_name || body.travelerName || 'Menon family',
        preferences: body.preferences || {
          primaryPriority: body.preference || 'balanced',
          hotelWeight: 40,
          flightWeight: 30,
          experienceWeight: 30
        }
      };

      const result = planner.buildPackages(normalizedRequest);
      if (result.packages) {
        for (const [key, pkg] of Object.entries(result.packages)) {
          if (pkg && pkg.trip_id) {
            activeTripsCache.set(pkg.trip_id, pkg);
          }
        }
      }
      return sendJson(res, 200, result);
    }

    // 5. GET /api/trips/:id
    if (req.method === 'GET' && pathname.startsWith('/api/trips/') && !pathname.endsWith('/export')) {
      const tripId = pathname.replace('/api/trips/', '').trim();
      const trip = activeTripsCache.get(tripId);
      if (trip) {
        return sendJson(res, 200, { success: true, trip });
      } else {
        return sendJson(res, 404, { success: false, error: 'Trip not found' });
      }
    }

    // 6. POST /api/trips/:id/validate & /api/packages/revalidate
    if (req.method === 'POST' && (pathname.endsWith('/validate') || pathname === '/api/packages/revalidate')) {
      const body = await parseBody(req);
      const trip = body.trip || activeTripsCache.get(pathname.split('/')[3]);
      if (!trip) {
        return sendJson(res, 400, { success: false, error: 'No trip data provided' });
      }
      const result = validator.recalculateAndValidateTrip(trip);
      if (trip.trip_id) {
        activeTripsCache.set(trip.trip_id, result.updated_trip);
      }
      return sendJson(res, 200, result);
    }

    // 7. PATCH /api/trips/:id/hotel & Options
    if (pathname.includes('/options/hotels') || (req.method === 'PATCH' && pathname.endsWith('/hotel'))) {
      const body = await parseBody(req);
      const trip = body.trip || activeTripsCache.get(pathname.split('/')[3]);
      const options = validator.getHotelSwapOptions(trip, body.city);
      return sendJson(res, 200, { options });
    }

    // 8. PATCH /api/trips/:id/flight & Options
    if (pathname.includes('/options/flights') || (req.method === 'PATCH' && pathname.endsWith('/flight'))) {
      const body = await parseBody(req);
      const trip = body.trip || activeTripsCache.get(pathname.split('/')[3]);
      const options = validator.getFlightSwapOptions(trip, body.direction);
      return sendJson(res, 200, { options });
    }

    // 9. Attractions: Add / Remove & Options
    if (pathname.includes('/options/attractions')) {
      const body = await parseBody(req);
      const trip = body.trip || activeTripsCache.get(pathname.split('/')[3]);
      const options = validator.getAttractionSwapOptions(trip, body.target_date || body.targetDate);
      return sendJson(res, 200, { options });
    }

    // 10. GET /api/trips/:id/export
    if (req.method === 'GET' && pathname.endsWith('/export')) {
      const parts = pathname.split('/');
      const tripId = parts[3];
      const trip = activeTripsCache.get(tripId) || storage.getReservation(tripId);
      if (trip) {
        setCorsHeaders(res);
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="trip_${tripId}.json"`
        });
        return res.end(JSON.stringify(trip, null, 2));
      } else {
        return sendJson(res, 404, { success: false, error: 'Trip export not found' });
      }
    }

    // 11. POST /api/bookings/confirm
    if (req.method === 'POST' && pathname === '/api/bookings/confirm') {
      const body = await parseBody(req);
      const tripData = body.trip || body.package;
      if (!tripData) {
        return sendJson(res, 400, { success: false, error: 'Missing trip data' });
      }
      const reservation = storage.createReservation(tripData);
      return sendJson(res, 200, { success: true, reservation });
    }

    // 12. GET /api/bookings/:reference or DELETE
    if (pathname.startsWith('/api/bookings/')) {
      const reference = pathname.replace('/api/bookings/', '').trim();
      if (req.method === 'DELETE') {
        storage.reservations.delete(reference);
        storage.saveData();
        return sendJson(res, 200, { success: true, message: 'Reservation cancelled successfully' });
      }
      if (req.method === 'GET') {
        const reservation = storage.getReservation(reference);
        if (reservation) {
          return sendJson(res, 200, { success: true, reservation, booking: reservation });
        } else {
          return sendJson(res, 404, { success: false, error: 'Reservation not found' });
        }
      }
    }

    // 13. GET /api/bookings (All saved reservations or query)
    if (req.method === 'GET' && pathname === '/api/bookings') {
      const ref = query.reference || query.ref;
      if (ref) {
        const reservation = storage.getReservation(ref);
        if (reservation) {
          return sendJson(res, 200, { success: true, reservation, booking: reservation });
        } else {
          return sendJson(res, 404, { success: false, error: 'Reservation not found' });
        }
      }
      const all = storage.getAllReservations();
      return sendJson(res, 200, { success: true, reservations: all });
    }

    // 14. GET /api/discovery/recommendations (Page 3)
    if (req.method === 'GET' && pathname === '/api/discovery/recommendations') {
      const recs = planner.discoverDestinations(query);
      return sendJson(res, 200, { success: true, destinations: recs });
    }

    // 15. POST /api/nlp/parse (Feature S1: Rule-based text parser)
    if (req.method === 'POST' && pathname === '/api/nlp/parse') {
      const body = await parseBody(req);
      const parsed = nlp.parse(body.query);
      return sendJson(res, 200, { success: true, parsed });
    }

    // 16. Static Images Serving
    if (pathname.startsWith('/images/')) {
      const relPath = pathname.replace('/images/', '');
      const fullPath = path.join(IMAGES_DIR, relPath);
      if (fs.existsSync(fullPath)) {
        return sendFile(res, fullPath, getContentType(path.extname(fullPath)));
      }
    }

    // 17. Static Frontend Serving
    let staticPath = path.join(FRONTEND_DIR, pathname === '/' ? 'index.html' : pathname);
    if (!fs.existsSync(staticPath)) {
      staticPath = path.join(FRONTEND_DIR, 'index.html');
    }
    if (fs.existsSync(staticPath)) {
      return sendFile(res, staticPath, getContentType(path.extname(staticPath)));
    }

    // Fallback 404
    sendJson(res, 404, { error: 'Not Found' });
  } catch (err) {
    console.error('Server error:', err);
    sendJson(res, 500, { success: false, error: err.message || 'Internal Server Error' });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`=======================================================`);
  console.log(`🏨 Smart Holiday Planner & Booking Platform`);
  console.log(`📍 Serving on: http://127.0.0.1:${PORT}`);
  console.log(`🚀 Pure Node.js REST API with zero external dependencies`);
  console.log(`=======================================================`);
});
