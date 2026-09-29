const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../frontend/src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remove from old location
const targetStr = `{downloadTender && <TenderDownloadModal tender={downloadTender} onClose={() => setDownloadTender(null)} />}\n`;
content = content.replace(targetStr, "");

// Add to new location (at the end of tenders section inside ManagedPage)
const replaceTarget = `              <a href="/contact?subject=Refinery%20Division%20RFQ">
                Request RFQ details <Icon name="arrow" size={17} />
              </a>
            </div>
          </div>
        </section>`;

const replacement = `              <a href="/contact?subject=Refinery%20Division%20RFQ">
                Request RFQ details <Icon name="arrow" size={17} />
              </a>
            </div>
          </div>
          {downloadTender && <TenderDownloadModal tender={downloadTender} onClose={() => setDownloadTender(null)} />}
        </section>`;

content = content.replace(replaceTarget, replacement);

fs.writeFileSync(filePath, content, 'utf8');
console.log('App.jsx modal placement fixed!');
