// Zero-dependency static dev server. Run: node server.mjs   (Node 18+)
// Serves this folder at http://localhost:5173. Set PORT=xxxx to change it.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p);
  if (!file.startsWith(root)) { res.writeHead(403).end('Forbidden'); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found: ' + p); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
});

let port = Number(process.env.PORT) || 5173;
const first = port;
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE' && port < first + 20) { port++; server.listen(port, '0.0.0.0'); }
  else { console.error('Could not start the server:', e.message); process.exit(1); }
});
server.on('listening', () => {
  console.log('\nCoverline Ops prototype is running');
  console.log(`  Open:  http://localhost:${port}`);
  console.log(`  or:    http://127.0.0.1:${port}`);
  console.log('  Stop:  Ctrl+C\n');
});
server.listen(port, '0.0.0.0');
