#!/usr/bin/env node
'use strict';

/**
 * Minimal static file server for the exported web build (dist/), plus
 * auto-opening the default browser once the server is actually
 * listening -- avoids the race condition of a launcher script opening
 * the browser before the server can respond.
 *
 * No dependencies on purpose: this has to run standalone via `node
 * desktop/serve.js` (or the .bat launcher) without an `npm install`
 * step, on any machine that already has Node.js installed.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT ? Number(process.env.PORT) : 4173;
const DIST_DIR = path.join(__dirname, '..', 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

/** Resolves a request path inside DIST_DIR, rejecting any attempt to escape it (e.g. "/../../secrets"). */
function resolveSafePath(requestUrl) {
  const decoded = decodeURIComponent(requestUrl.split('?')[0]);
  const resolved = path.normalize(path.join(DIST_DIR, decoded));
  if (resolved !== DIST_DIR && !resolved.startsWith(DIST_DIR + path.sep)) {
    return null;
  }
  return resolved;
}

if (!fs.existsSync(DIST_DIR) || !fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
  console.error(`No se encontro un build web en: ${DIST_DIR}`);
  console.error('Genera uno primero con: npm run build:web');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  let filePath = resolveSafePath(req.url || '/');
  if (!filePath) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Solicitud invalida.');
    return;
  }
  if (filePath.endsWith(path.sep) || filePath === DIST_DIR) {
    filePath = path.join(filePath, 'index.html');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // No extension and not found: likely client-side navigation -- fall back to index.html.
      if (path.extname(filePath) === '') {
        fs.readFile(path.join(DIST_DIR, 'index.html'), (fallbackErr, indexData) => {
          if (fallbackErr) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('No encontrado.');
            return;
          }
          res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'] });
          res.end(indexData);
        });
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('No encontrado.');
      return;
    }
    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

function openBrowser(url) {
  const commandByPlatform = {
    win32: `start "" "${url}"`,
    darwin: `open "${url}"`,
  };
  const command = commandByPlatform[process.platform] || `xdg-open "${url}"`;
  exec(command, (err) => {
    if (err) {
      console.log(`No se pudo abrir el navegador automaticamente. Abrelo manualmente en: ${url}`);
    }
  });
}

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`telecomm-propagation sirviendo en ${url}`);
  console.log('Deja esta ventana abierta mientras uses la app. Ciérrala para detenerla.');
  openBrowser(url);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`El puerto ${PORT} ya está en uso. Cierra lo que lo esté usando o define otro puerto: set PORT=4174 && node desktop\\serve.js`);
  } else {
    console.error('Error del servidor:', err.message);
  }
  process.exit(1);
});
