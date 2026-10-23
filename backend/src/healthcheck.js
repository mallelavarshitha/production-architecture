const http = require('http');

const port = process.env.PORT || 5000;

const options = {
  host: '127.0.0.1',
  port: port,
  path: '/api/health',
  timeout: 4000,
};

const request = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    console.error(`Healthcheck failed with status: ${res.statusCode}`);
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.error(`Healthcheck network error: ${err.message}`);
  process.exit(1);
});

request.on('timeout', () => {
  console.error('Healthcheck request timed out.');
  request.destroy();
  process.exit(1);
});

request.end();
