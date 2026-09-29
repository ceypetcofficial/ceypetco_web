const fs = require('fs');
let content = fs.readFileSync('D:\\Cepetco\\ceypetco-redesign\\frontend\\src\\index.css', 'utf8');

const newCSS = `

/* OVERRIDES FOR HERO TO MATCH IMAGE */
.hero-inner {
  max-width: 1300px !important;
  width: 100% !important;
  margin: 0 auto !important;
  padding-left: 80px !important;
}
.hero-copy-panel {
  padding-left: 30px !important;
  position: relative !important;
}
.hero-accent {
  position: absolute !important;
  left: 0 !important;
  top: -20px !important;
  bottom: -20px !important;
  width: 4px !important;
  background-color: #e31837 !important;
}
.slider-arrow {
  background-color: #e31837 !important;
  width: 56px !important;
  height: 56px !important;
  border-radius: 0 !important;
  border: none !important;
  opacity: 1 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: white !important;
}
.slider-arrow.prev { left: 0 !important; }
.slider-arrow.next { right: 0 !important; }
.hero-link {
  background-color: #e31837 !important;
  color: white !important;
  border: none !important;
  border-radius: 4px !important;
  height: 50px !important;
  padding: 0 24px !important;
  display: inline-flex !important;
  align-items: center !important;
  font-weight: 800 !important;
  text-transform: uppercase !important;
  font-size: 13px !important;
  letter-spacing: 0.5px !important;
  text-decoration: none !important;
}
.hero-link svg {
  margin-left: 8px !important;
}
.hero-copy-panel h1 {
  text-transform: uppercase !important;
  font-size: 64px !important;
  font-weight: 900 !important;
  line-height: 1.05 !important;
  margin: 10px 0 20px 0 !important;
}
.hero-copy-panel .eyebrow {
  font-weight: 800 !important;
  letter-spacing: 2px !important;
  font-size: 13px !important;
  margin-bottom: 10px !important;
  text-transform: uppercase !important;
}
.hero-copy-panel .hero-copy {
  font-size: 18px !important;
  max-width: 600px !important;
  line-height: 1.6 !important;
  margin-bottom: 30px !important;
}
`;

fs.writeFileSync('D:\\Cepetco\\ceypetco-redesign\\frontend\\src\\index.css', content + newCSS);
console.log('index.css updated');
