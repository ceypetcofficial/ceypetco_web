const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../frontend/src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const callTarget = `<PopupNotice />`;
const callReplacement = `{downloadTender && <TenderDownloadModal tender={downloadTender} onClose={() => setDownloadTender(null)} />}\n      <PopupNotice />`;
content = content.replace(callTarget, callReplacement);

const componentDefinition = `
function TenderDownloadModal({ tender, onClose }) {
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/tender-downloads', {
        tenderId: tender._id,
        email,
        mobileNumber
      });
      // Success: download and close
      window.open(tender.url, '_blank');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request download');
      setLoading(false);
    }
  };

  return (
    <div className="popup-notice-overlay" style={{display: 'flex', zIndex: 9999}}>
      <div className="popup-notice-modal" style={{maxWidth: '800px', width: '90%', display: 'flex', flexDirection: 'column', padding: 0}}>
        <div style={{padding: '24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2 style={{margin: 0, fontSize: '1.25rem'}}>Download Tender Document</h2>
          <button onClick={onClose} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem'}}>&times;</button>
        </div>
        
        <div style={{display: 'flex', flexWrap: 'wrap'}}>
          {/* Form Side */}
          <div style={{flex: '1 1 300px', padding: '24px', borderRight: '1px solid #eee'}}>
            <p style={{marginBottom: '1rem', color: '#666', fontSize: '0.9rem'}}>Please provide your contact details to download the tender document for <strong>{tender.title}</strong>.</p>
            {error && <div style={{color: 'red', marginBottom: '1rem', fontSize: '0.9rem'}}>{error}</div>}
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <label>
                <span style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Email Address *</span>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px'}} />
              </label>
              <label>
                <span style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Mobile Number *</span>
                <input type="tel" required value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px'}} />
              </label>
              <button type="submit" disabled={loading} className="btn-primary" style={{marginTop: '0.5rem'}}>
                {loading ? 'Processing...' : 'Submit & Download'}
              </button>
            </form>
          </div>
          
          {/* Preview Side */}
          <div style={{flex: '1 1 300px', padding: '24px', backgroundColor: '#fafafa'}}>
            <p style={{marginBottom: '1rem', fontWeight: 600}}>Document Preview</p>
            <div style={{width: '100%', height: '300px', border: '1px solid #ddd', background: '#fff', overflow: 'hidden'}}>
              <iframe src={tender.url} width="100%" height="100%" style={{border: 'none'}}></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
`;

content = content.replace("export default App;", componentDefinition);

fs.writeFileSync(filePath, content, 'utf8');
console.log('App.jsx updated with Modal successfully!');
