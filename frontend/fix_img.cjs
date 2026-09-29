const fs = require('fs');
let content = fs.readFileSync('D:\\Cepetco\\ceypetco-redesign\\frontend\\src\\components\\marine-bunkering\\BunkeringIntro.jsx', 'utf8');
content = content.replace('marine-fuel-transfer.webp', 'jupiter-sun.jpg');
fs.writeFileSync('D:\\Cepetco\\ceypetco-redesign\\frontend\\src\\components\\marine-bunkering\\BunkeringIntro.jsx', content);
console.log('BunkeringIntro.jsx updated');
