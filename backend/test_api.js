const http = require('http');

http.get('http://localhost:5001/api/admin/annual-reports/active', (res) => {
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
