const fs = require('fs');
let content = fs.readFileSync('D:\\Cepetco\\ceypetco-redesign\\frontend\\src\\index.css', 'utf8');

const overrides = `
/* STRIPES OVERRIDE */
.every-drop-accents {
    top: -40px !important;
    right: 0px !important;
    gap: 8px !important;
}
.every-drop-accents span {
    width: 6px !important;
    height: 38px !important;
    background-color: #e31837 !important;
    border-radius: 4px !important;
}
`;

fs.writeFileSync('D:\\Cepetco\\ceypetco-redesign\\frontend\\src\\index.css', content + overrides);
console.log('stripes updated');
