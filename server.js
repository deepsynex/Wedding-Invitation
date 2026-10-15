/**
 * Local Node.js Backend Server for Wedding RSVP & Book1.csv CRUD Operations
 * Zero external dependencies (uses standard Node.js http, fs, and path modules)
 * Serves static files and provides REST API to read/write Book1.csv directly on disk.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const CSV_FILE = path.join(ROOT_DIR, 'Book1.csv');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const CSV_HEADERS = [
  'Sr. NO.',
  'Guest name ',
  'Total attendee',
  'Attendee 1',
  'Attendee 2',
  'Attendee 3',
  'Attendee 4',
  'Attendee 5',
  'Attendee 6',
  'Attendee 7',
  'Attendee 8',
  'Attendee 9',
  'Attendee 10'
];

// Helper: Parse CSV string to JSON records
function parseCsv(content) {
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return [];

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cells = parseCsvLine(line);
    if (!cells || cells.length === 0) continue;

    const srNo = parseInt(cells[0], 10) || i;
    const guestName = (cells[1] || '').trim();
    const totalAttendee = parseInt(cells[2], 10) || (guestName ? 1 : 0);

    const attendees = [];
    for (let c = 3; c < 13; c++) {
      if (cells[c] && cells[c].trim().length > 0) {
        attendees.push(cells[c].trim());
      }
    }

    // Split guest name into first/last
    const nameParts = guestName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    records.push({
      srNo,
      guestName,
      firstName,
      lastName,
      totalAttendee,
      attendees,
      attendance: totalAttendee > 0 ? 'attending' : 'regrets',
      bringingGuest: attendees.length > 0 ? 'yes' : 'no',
      guestCount: attendees.length
    });
  }
  return records;
}

// Helper: Parse a single CSV line with support for quotes
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Helper: Convert JSON records to CSV string
function recordsToCsv(records) {
  const rows = [CSV_HEADERS.join(',')];

  records.forEach((rec, idx) => {
    const row = [
      idx + 1,
      `"${(rec.guestName || '').replace(/"/g, '""')}"`,
      rec.totalAttendee !== undefined ? rec.totalAttendee : (rec.attendees ? 1 + rec.attendees.length : 1)
    ];

    for (let i = 0; i < 10; i++) {
      const att = (rec.attendees && rec.attendees[i]) ? rec.attendees[i] : '';
      row.push(att ? `"${att.replace(/"/g, '""')}"` : '');
    }
    rows.push(row.join(','));
  });

  return rows.join('\r\n') + '\r\n';
}

function readRecordsFromDisk() {
  if (!fs.existsSync(CSV_FILE)) {
    return [];
  }
  const content = fs.readFileSync(CSV_FILE, 'utf8');
  return parseCsv(content);
}

function writeRecordsToDisk(records) {
  // Re-index sequentially
  records.forEach((r, idx) => {
    r.srNo = idx + 1;
  });
  const csvText = recordsToCsv(records);
  fs.writeFileSync(CSV_FILE, csvText, 'utf8');
  return records;
}

// Request Body Parser Helper
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Send JSON Response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Master HTTP Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // =========================================================================
  // REST API: Book1.csv CRUD Operations
  // =========================================================================

  // GET /api/rsvps - Read all records from Book1.csv
  if (method === 'GET' && pathname === '/api/rsvps') {
    try {
      const records = readRecordsFromDisk();
      sendJson(res, 200, { success: true, count: records.length, records });
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
    }
    return;
  }

  // POST /api/rsvps - Create new RSVP record in Book1.csv
  if (method === 'POST' && pathname === '/api/rsvps') {
    try {
      const body = await parseJsonBody(req);
      const records = readRecordsFromDisk();

      const firstName = (body.firstName || '').trim();
      const lastName = (body.lastName || '').trim();
      const guestName = body.guestName || `${firstName} ${lastName}`.trim();
      const attendance = body.attendance || 'attending';
      const attendees = Array.isArray(body.attendees) ? body.attendees.filter(a => a && a.trim()) : [];
      const totalAttendee = attendance === 'attending' ? (1 + attendees.length) : 0;

      const newRecord = {
        srNo: records.length + 1,
        guestName,
        firstName,
        lastName,
        totalAttendee,
        attendees,
        attendance,
        bringingGuest: attendees.length > 0 ? 'yes' : 'no',
        guestCount: attendees.length,
        submittedAt: new Date().toISOString()
      };

      records.push(newRecord);
      const saved = writeRecordsToDisk(records);
      sendJson(res, 201, { success: true, message: 'RSVP saved to Book1.csv', record: newRecord, records: saved });
    } catch (err) {
      sendJson(res, 400, { success: false, error: err.message });
    }
    return;
  }

  // PUT /api/rsvps/:srNo - Update existing record in Book1.csv
  const putMatch = pathname.match(/^\/api\/rsvps\/(\d+)$/);
  if (method === 'PUT' && putMatch) {
    try {
      const targetSr = parseInt(putMatch[1], 10);
      const body = await parseJsonBody(req);
      const records = readRecordsFromDisk();

      const index = records.findIndex(r => r.srNo === targetSr);
      if (index === -1) {
        return sendJson(res, 404, { success: false, error: `Record with Sr. NO. ${targetSr} not found` });
      }

      const firstName = (body.firstName || '').trim() || records[index].firstName;
      const lastName = (body.lastName || '').trim() || records[index].lastName;
      const guestName = body.guestName || `${firstName} ${lastName}`.trim();
      const attendance = body.attendance || records[index].attendance;
      const attendees = Array.isArray(body.attendees) ? body.attendees.filter(a => a && a.trim()) : records[index].attendees;
      const totalAttendee = attendance === 'attending' ? (1 + attendees.length) : 0;

      records[index] = {
        ...records[index],
        guestName,
        firstName,
        lastName,
        totalAttendee,
        attendees,
        attendance,
        bringingGuest: attendees.length > 0 ? 'yes' : 'no',
        guestCount: attendees.length,
        updatedAt: new Date().toISOString()
      };

      const saved = writeRecordsToDisk(records);
      sendJson(res, 200, { success: true, message: 'Record updated in Book1.csv', record: records[index], records: saved });
    } catch (err) {
      sendJson(res, 400, { success: false, error: err.message });
    }
    return;
  }

  // DELETE /api/rsvps/:srNo - Delete record from Book1.csv
  const deleteMatch = pathname.match(/^\/api\/rsvps\/(\d+)$/);
  if (method === 'DELETE' && deleteMatch) {
    try {
      const targetSr = parseInt(deleteMatch[1], 10);
      let records = readRecordsFromDisk();

      const beforeLen = records.length;
      records = records.filter(r => r.srNo !== targetSr);

      if (records.length === beforeLen) {
        return sendJson(res, 404, { success: false, error: `Record with Sr. NO. ${targetSr} not found` });
      }

      const saved = writeRecordsToDisk(records);
      sendJson(res, 200, { success: true, message: 'Record deleted from Book1.csv', records: saved });
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
    }
    return;
  }

  // POST /api/rsvps/sync - Bulk update Book1.csv
  if (method === 'POST' && pathname === '/api/rsvps/sync') {
    try {
      const body = await parseJsonBody(req);
      if (!Array.isArray(body.records)) {
        return sendJson(res, 400, { success: false, error: 'Expected records array' });
      }
      const saved = writeRecordsToDisk(body.records);
      sendJson(res, 200, { success: true, message: 'Book1.csv synchronized', records: saved });
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
    }
    return;
  }

  // =========================================================================
  // Static File Serving
  // =========================================================================
  let safePath = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(ROOT_DIR, safePath);

  // Security check: ensure path is within ROOT_DIR
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>404 Not Found</h1><p>The file <code>${escape(pathname)}</code> was not found.</p>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`[RSVP Server] Wedding Invitation & Book1.csv CRUD Server running at http://127.0.0.1:${PORT}`);
  console.log(`[RSVP Server] Serving files from: ${ROOT_DIR}`);
  console.log(`[RSVP Server] Book1.csv target: ${CSV_FILE}`);
});
