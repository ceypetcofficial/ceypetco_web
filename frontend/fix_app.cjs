const fs = require('fs');
let content = fs.readFileSync('D:\\Cepetco\\ceypetco-redesign\\frontend\\src\\App.jsx', 'utf8');

const regex = /const heroSlides = \[\s*\{\s*image: 'https:\/\/images\.squarespace-cdn\.com[^}]+\},/s;
const replacement = `const heroSlides = [
  {
    image: 'https://images.squarespace-cdn.com/content/v1/693bf5941493ec4ce40a537d/f2785c86-6ee9-429c-a714-cd0e945aea44/Billboard+Image.jpg',
    alt: 'Offshore oil rig and support vessels at sunset',
    eyebrow: 'ISLANDWIDE DISTRIBUTION.',
    title: (
      <>
        UNLOCKING SRI LANKA\\'S
        <br />
        OFFSHORE OIL &amp; NATURAL GAS
        <br />
        POTENTIAL
      </>
    ),
    copy: 'The Petroleum Development Authority of Sri Lanka (PDASL) invites qualified energy companies to participate in the Sri Lanka Licensing Round 2026 - offering access to one of South Asia\\'s most prospective basins.',
    cta: 'Learn more about PDASL',
    href: 'https://www.srilankalicensinground.com/',
  },`;

content = content.replace(regex, replacement);
fs.writeFileSync('D:\\Cepetco\\ceypetco-redesign\\frontend\\src\\App.jsx', content);
console.log('App.jsx updated');
