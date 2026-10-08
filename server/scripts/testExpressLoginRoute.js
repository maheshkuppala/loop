const app = require('../app');
const http = require('http');
const { connectPostgres } = require('../config/postgres');

async function testRoute() {
  await connectPostgres();

  const server = http.createServer(app);
  server.listen(0, async () => {
    const port = server.address().port;
    console.log(`Test server running on port ${port}`);

    const postData = JSON.stringify({
      email: 'tharunkumarmallela2659@gmail.com',
      password: 'TestPassword123!'
    });

    const req = http.request({
      hostname: '127.0.0.1',
      port: port,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      console.log(`HTTP Status Code: ${res.statusCode}`);
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('HTTP Response Body:', body);
        server.close();
        process.exit(0);
      });
    });

    req.on('error', err => {
      console.error('Request error:', err);
      server.close();
      process.exit(1);
    });

    req.write(postData);
    req.end();
  });
}

testRoute();
