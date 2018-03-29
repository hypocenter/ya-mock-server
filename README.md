Usage: see example directory.

```js
const path = require('path')
const { MockServer } = require('ya-mock-server');

const mockServer = new MockServer('http://127.0.0.1:3000', path.join(__dirname, 'data', '*.mock.js'))
mockServer.start()
```
