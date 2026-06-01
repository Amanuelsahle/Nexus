const path = require('path');

process.env.HOST = '0.0.0.0';
process.env.PORT = '1234';

require(path.join(__dirname, '..', 'node_modules', 'y-websocket', 'bin', 'server.js'));
