import { LightbulbIcon } from '../../components/icons';

const DashboardGettingStarted = () => (
  <div className="detail-section">
    <div className="detail-section-title d-flex align-items-center"><LightbulbIcon size={20} className="me-2"/> Getting Started</div>
    <p style={{ color: '#64748b', fontSize: '.9rem', margin: 0 }}>
      Use the <strong>Search Routes</strong> page to find buses and trains between districts.
      Click any transport to view its stops, crowd level, schedule, and fare — then save it
      as a favourite for quick access here.
    </p>
  </div>
);

export default DashboardGettingStarted;
