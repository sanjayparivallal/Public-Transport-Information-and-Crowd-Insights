import { UserIcon, CheckCircleIcon, PauseIcon } from '../../components/icons';

const DashboardAccountInfo = ({ profile, user }) => {
  return (
    <div className="detail-section">
      <div className="detail-section-title d-flex align-items-center"><UserIcon size={20} className="me-2"/> Your Account</div>
      <div className="info-grid">
        <div className="info-item"><label>Name</label><span>{profile?.name || '—'}</span></div>
        <div className="info-item"><label>Email</label><span>{profile?.email || user.email}</span></div>
        <div className="info-item">
          <label>Role</label>
          <span>
            <span className={`role-pill ${user.role}`}>{user.role}</span>
          </span>
        </div>
        <div className="info-item"><label>Phone</label><span>{profile?.phone || '—'}</span></div>
        <div className="info-item">
          <label>Account Status</label>
          <span style={{ color: profile?.isActive !== false ? 'var(--success)' : '#94a3b8', fontWeight: 700 }}>
            {profile?.isActive !== false ? <span className="d-flex align-items-center"><CheckCircleIcon size={14} className="me-1"/> Active</span> : <span className="d-flex align-items-center"><PauseIcon size={14} className="me-1"/> Inactive</span>}
          </span>
        </div>
        <div className="info-item">
          <label>Member Since</label>
          <span>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardAccountInfo;
