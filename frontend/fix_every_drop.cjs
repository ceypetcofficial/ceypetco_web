const fs = require('fs');
let content = fs.readFileSync('D:\\Cepetco\\ceypetco-redesign\\frontend\\src\\index.css', 'utf8');

const overrides = `

/* OVERRIDES FOR EVERY DROP SECTION TO MATCH IMAGE */
.every-drop-section {
    background: #f4f8fa !important;
}
.every-drop-title {
    font-family: 'Outfit', 'Space Grotesk', sans-serif !important;
}
.every-drop-description {
    font-family: 'Outfit', 'Space Grotesk', sans-serif !important;
    font-weight: 600 !important;
}
.drop-feature-card {
    background: #ffffff !important;
    border: 1px solid transparent !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.03) !important;
}
.drop-feature-card:hover {
    border-color: #ffcccc !important;
}
.every-drop-image-wrapper {
    border-radius: 80px 0 0 0 !important;
}
.every-drop-img {
    border-radius: 80px 0 0 0 !important;
}
.image-overlay-gradient {
    border-radius: 80px 0 0 0 !important;
}
.every-drop-accents {
    top: 20px !important;
    right: 30px !important;
    display: flex !important;
    gap: 6px !important;
    z-index: 10 !important;
}
.every-drop-badge {
    position: absolute !important;
    bottom: -60px !important;
    left: 0 !important;
    margin-top: 0 !important;
}
.badge-number {
    font-size: 8rem !important;
    font-family: 'League Spartan', sans-serif !important;
    font-weight: 800 !important;
}
.badge-text {
    font-size: 1rem !important;
    font-family: 'League Spartan', sans-serif !important;
    font-weight: 800 !important;
    color: #0f2b3c !important;
}
`;

fs.writeFileSync('D:\\Cepetco\\ceypetco-redesign\\frontend\\src\\index.css', content + overrides);
console.log('index.css updated');
