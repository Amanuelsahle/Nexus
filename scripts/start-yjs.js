// Simple Yjs WebSocket server for collaborative editor
// Listens on port 1234 (default) and serves Yjs documents.

const http = require('http');
const WebSocket = require('ws');
// Load environment variables from .env.local (used by Next.js and this script)
require('dotenv').config({ path: '.env.local' });
// Debug: print loaded YJS_PORT
console.log('Loaded YJS_PORT:', process.env.YJS_PORT);
const { setupWSConnection } = require('y-websocket/bin/utils');

const port = process.env.YJS_PORT ? parseInt(process.env.YJS_PORT, 10) : 1235;

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Yjs WebSocket Server');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (conn, req) => {
  // Yjs will use the URL path as the document name, e.g., /document-<id>
  const docName = req.url.slice(1).split('?')[0];
  setupWSConnection(conn, req, { docName });
});

server.listen(port, () => {
  console.log(`Yjs server listening on http://localhost:${port}`);
});
