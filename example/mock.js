const path = require('path');
const { MockServer } = require('../index');

const mockServer = new MockServer('http://127.0.0.1:3000', path.join(__dirname, 'data', '*.mock.js'));
mockServer.start();