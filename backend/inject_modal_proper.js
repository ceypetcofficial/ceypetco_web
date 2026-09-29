const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../frontend/src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// I want to replace the sequence:
//           </div>
//         </section>
// that occurs right after the `tender-rfq-note` div block.

// Find index of 'tender-rfq-note'
const rfqIndex = content.indexOf('tender-rfq-note');
if (rfqIndex > -1) {
  // Find the first </section> after this index
  const sectionCloseIndex = content.indexOf('</section>', rfqIndex);
  
  if (sectionCloseIndex > -1) {
    // Insert the modal injection just before </section>
    const modalTag = `{downloadTender && <TenderDownloadModal tender={downloadTender} onClose={() => setDownloadTender(null)} />}\n        `;
    
    // Check if it's already there
    if (!content.includes('<TenderDownloadModal tender={downloadTender}')) {
      content = content.substring(0, sectionCloseIndex) + modalTag + content.substring(sectionCloseIndex);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Successfully injected the modal component into the Tenders section!');
    } else {
      console.log('Modal tag already exists in the file somewhere.');
    }
  }
}
