const fs = require('fs');
let c = fs.readFileSync('frontend/src/App.jsx', 'utf8');
c = c.replace(/\]\.join\('.'\),\n    \);/g, "].join(',');");
c = c.replace(/\]\.join\('.'\),\r\n    \);/g, "].join(',');");
c = c.replace(`].join(','),\n    );`, `].join(',');`);
c = c.replace(`].join(','),\r\n    );`, `].join(',');`);
c = c.replace(/targets\.forEach\(\(element, index\) => {\s+element\.classList\.add\('reveal-item'\);\s+element\.style\.setProperty\('--reveal-delay', `\$\{\(index \% 4\) \* 70\}ms`\);\s+}\);/, '');
fs.writeFileSync('frontend/src/App.jsx', c);
console.log('Fixed syntax error!');
