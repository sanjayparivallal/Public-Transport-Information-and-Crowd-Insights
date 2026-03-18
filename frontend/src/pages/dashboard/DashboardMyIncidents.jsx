import { useState, useEffect } from 'react';
import { getAllIncidents, deleteIncident } from '../../api/incidentApi';
import IncidentList from '../../components/IncidentList';

const DashboardMyIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyIncidents = async () => {
    setLoading(true);
    try {
      const res = await getAllIncidents();
      const payload = res.data?.data || res.data;
      setIncidents(payload?.incidents || []);
    } catch (err) {
      setError('Failed to load your incidents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyIncidents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await deleteIncident(id);
      setIncidents(prev => prev.filter(inc => inc._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete incident.');
    }
  };

  if (loading) {
    return (
      <div className="card-custom h-100 p-4 mb-4">
        <h3 className="card-title-custom">My Reported Incidents</h3>
        <p className="text-muted" style={{ fontSize: '.85rem' }}>Loading incidents...</p>
      </div>
    );
  }

  return (
    <div className="card-custom h-100 p-4 mb-4">
      <h3 className="card-title-custom">My Reported Incidents</h3>
      {error && <p className="text-danger" style={{ fontSize: '.85rem' }}>{error}</p>}
      {!error && incidents.length === 0 ? (
        <p className="text-muted" style={{ fontSize: '.85rem' }}>You have not reported any incidents recently.</p>
      ) : (
        <IncidentList incidents={incidents} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default DashboardMyIncidents;
