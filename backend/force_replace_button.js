const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../frontend/src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /<a\s*href=\{\s*item\.documents && item\.documents\.length\s*\?\s*item\.documents\[0\]\.url\s*:\s*'#'\s*\}\s*target="_blank"\s*rel="noreferrer"\s*>\s*Download tender <Icon name="download" size=\{16\} \/>\s*<\/a>/;

const replacement = `<button
                          type="button"
                          className="btn-text"
                          onClick={(e) => {
                            e.preventDefault();
                            if (item.documents && item.documents.length) {
                              setDownloadTender({ ...item, url: item.documents[0].url });
                            }
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--cpc-red)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          Download tender <Icon name="download" size={16} />
                        </button>`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('App.jsx updated with button successfully!');
} else {
  console.log('Could not find the target string in App.jsx. Here is a snippet of that area:');
  const index = content.indexOf('Download tender');
  console.log(content.substring(index - 200, index + 200));
}
