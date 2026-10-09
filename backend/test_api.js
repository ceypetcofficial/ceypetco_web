const http = require('http');
const https = require('https');

if (!process.env.API_TEST_URL) throw new Error('API_TEST_URL must be set explicitly');
const endpoint = new URL('/api/admin/annual-reports/active', process.env.API_TEST_URL);
if (!['http:', 'https:'].includes(endpoint.protocol)) throw new Error('API_TEST_URL must use HTTP or HTTPS');
const client = endpoint.protocol === 'https:' ? https : http;

client.get(endpoint, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Keys of first item:', Object.keys(parsed.data[0]));
      console.log('Value of _id:', parsed.data[0]._id);
      console.log('Value of id:', parsed.data[0].id);
    } catch (e) {
      console.log('Error parsing JSON:', e.message);
    }
  });
});
