const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../frontend/src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetA = `<a
                          href={
                            item.documents && item.documents.length
                              ? item.documents[0].url
                              : '#'
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download tender <Icon name="download" size={16} />
                        </a>`;

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

content = content.replace(targetA, replacement);

fs.writeFileSync(filePath, content, 'utf8');
console.log('App.jsx updated with button successfully!');
