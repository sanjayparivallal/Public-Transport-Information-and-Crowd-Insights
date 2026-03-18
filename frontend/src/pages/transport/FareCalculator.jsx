import { useState } from 'react';
import { SearchIcon } from '../../components/icons';

const FareCalculator = ({ fareTable }) => {
  const [fareFrom, setFareFrom]     = useState('');
  const [fareTo, setFareTo]         = useState('');
  const [fareResult, setFareResult] = useState(null);
  const [fareClass, setFareClass]   = useState('general');

  const handleFareCalc = () => {
    if (!fareFrom || !fareTo) return;
    if (!fareTable?.length) { setFareResult('No fare data available.'); return; }
    const entry = fareTable.find(
      f => ((f.fromStop.toLowerCase() === fareFrom.toLowerCase() &&
             f.toStop.toLowerCase()   === fareTo.toLowerCase()) || 
            (f.fromStop.toLowerCase() === fareTo.toLowerCase() &&
             f.toStop.toLowerCase()   === fareFrom.toLowerCase())) &&
           (f.fareClass || 'general') === fareClass
    );
    if (entry) {
      setFareResult(`₹${entry.fare} (${entry.fareClass})`);
    } else {
      setFareResult('Fare not found for this stop pair / class.');
    }
  };

  return (
    <div className="detail-section">
      <div className="detail-section-title d-flex align-items-center"><SearchIcon size={20} className="me-2"/> Fare Calculator</div>
      {fareTable?.length > 0 ? (
        <>
          <div className="mb-2">
            <label className="form-label">From Stop</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Salem"
              value={fareFrom}
              onChange={e => { setFareFrom(e.target.value); setFareResult(null); }}
            />
          </div>
          <div className="mb-2">
            <label className="form-label">To Stop</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Chennai"
              value={fareTo}
              onChange={e => { setFareTo(e.target.value); setFareResult(null); }}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Class</label>
            <select className="form-select" value={fareClass} onChange={e => setFareClass(e.target.value)}>
              <option value="general">General</option>
              <option value="AC">AC</option>
              <option value="sleeper">Sleeper</option>
            </select>
          </div>
          <button className="btn btn-primary btn-sm w-100" onClick={handleFareCalc}>
            Calculate Fare
          </button>
          {fareResult && (
            <div className="mt-3 text-center">
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2563eb' }}>
                {fareResult}
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-muted" style={{ fontSize: '.85rem' }}>
          No fare table available for this transport.
        </p>
      )}
    </div>
  );
};
export default FareCalculator;
