const http = require('http');

const postData = JSON.stringify({
  email: 'tharunkumarmallela2659@gmail.com',
  password: 'TestPassword123!'
});

const req = http.request({
  hostname: '127.0.0.1',
  port: 10000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Response Body:', data);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
