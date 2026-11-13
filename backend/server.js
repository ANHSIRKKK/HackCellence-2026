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

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
    case '.js': return 'application/javascript';
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
    // 1. API: Catalog Metadata
    if (req.method === 'GET' && pathname === '/api/catalog/metadata') {
      return sendJson(res, 200, {
        departure_cities: catalog.destinations.departure_cities,
        countries: catalog.destinations.countries.map(c => ({
          code: c.code,
          name: c.name,
          cities: c.cities.map(ct => ct.name)
        })),
        rules: catalog.destinations.rules
      });
    }

    // 2. API: Generate Package
    if (req.method === 'POST' && pathname === '/api/packages/generate') {
      const body = await parseBody(req);
      const result = planner.buildPackages(body);
      return sendJson(res, 200, result);
    }

    // 3. API: Revalidate Trip
    if (req.method === 'POST' && pathname === '/api/packages/revalidate') {
      const body = await parseBody(req);
      const result = validator.recalculateAndValidateTrip(body.trip);
      return sendJson(res, 200, result);
    }

    // 4. API: Hotel Options for Swapping
    if (req.method === 'POST' && pathname === '/api/packages/options/hotels') {
      const body = await parseBody(req);
      const options = validator.getHotelSwapOptions(body.trip, body.city);
      return sendJson(res, 200, { options });
    }

    // 5. API: Flight Options for Swapping
    if (req.method === 'POST' && pathname === '/api/packages/options/flights') {
      const body = await parseBody(req);
      const options = validator.getFlightSwapOptions(body.trip, body.direction);
      return sendJson(res, 200, { options });
    }

    // 6. API: Attraction Options for Swapping
    if (req.method === 'POST' && pathname === '/api/packages/options/attractions') {
      const body = await parseBody(req);
      const options = validator.getAttractionSwapOptions(body.trip, body.target_date);
      return sendJson(res, 200, { options });
    }

    // 7. API: Confirm Booking
    if (req.method === 'POST' && pathname === '/api/bookings/confirm') {
      const body = await parseBody(req);
      if (!body.trip) {
        return sendJson(res, 400, { success: false, error: 'Missing trip data' });
      }
      const reservation = storage.createReservation(body.trip);
      return sendJson(res, 200, { success: true, reservation });
    }

    // 8. API: Get Booking by Reference
    if (req.method === 'GET' && pathname.startsWith('/api/bookings/')) {
      const reference = pathname.replace('/api/bookings/', '').trim();
      const reservation = storage.getReservation(reference);
      if (reservation) {
        return sendJson(res, 200, { success: true, reservation });
      } else {
        return sendJson(res, 404, { success: false, error: 'Reservation not found' });
      }
    }

    // 9. API: Get All Bookings
    if (req.method === 'GET' && pathname === '/api/bookings') {
      const all = storage.getAllReservations();
      return sendJson(res, 200, { success: true, reservations: all });
    }

    // 10. API: NLP Quick Request Parser
    if (req.method === 'POST' && pathname === '/api/nlp/parse') {
      const body = await parseBody(req);
      const parsed = nlp.parse(body.query);
      return sendJson(res, 200, { success: true, parsed });
    }

    // 11. Static Images Serving
    if (pathname.startsWith('/images/')) {
      const relPath = pathname.replace('/images/', '');
      const fullPath = path.join(IMAGES_DIR, relPath);
      if (fs.existsSync(fullPath)) {
        return sendFile(res, fullPath, getContentType(path.extname(fullPath)));
      }
    }

    // 12. Static Frontend Serving
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
  console.log(`🏨 Build My Holiday Server running at http://127.0.0.1:${PORT}`);
  console.log(`⚡ Zero external dependencies required - Pure Node.js`);
  console.log(`=======================================================`);
});
