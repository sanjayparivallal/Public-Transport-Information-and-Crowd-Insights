import { KeyIcon } from '../../components/icons';

const ProfileViewInfo = ({ user, profile, assignedTransportLabel, onChangePassword }) => {
  return (
    <div className="info-grid">
      <div className="info-item"><label>Name</label><span>{profile?.name || '—'}</span></div>
      <div className="info-item"><label>Email</label><span>{profile?.email || user.email}</span></div>
      <div className="info-item"><label>Role</label><span style={{ textTransform: 'capitalize' }}>{user.role}</span></div>
      <div className="info-item"><label>Phone</label><span>{profile?.phone || '—'}</span></div>
      {profile?.organizationName && (
        <div className="info-item"><label>Organisation</label><span>{profile.organizationName}</span></div>
      )}
      {profile?.region && (
        <div className="info-item"><label>Region</label><span>{profile.region}</span></div>
      )}
      {profile?.contactEmail && (
        <div className="info-item"><label>Contact Email</label><span>{profile.contactEmail}</span></div>
      )}
      {profile?.contactPhone && (
        <div className="info-item"><label>Contact Phone</label><span>{profile.contactPhone}</span></div>
      )}
      {profile?.officeAddress && (
        <div className="info-item"><label>Office Address</label><span>{profile.officeAddress}</span></div>
      )}
      {profile?.coveredDistricts?.length > 0 && (
        <div className="info-item"><label>Covered Districts</label><span>{profile.coveredDistricts.join(', ')}</span></div>
      )}
      {assignedTransportLabel && (
        <div className="info-item"><label>Assigned Transport</label><span>{assignedTransportLabel}</span></div>
      )}
      <div className="info-item mt-3 pt-3" style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border)' }}>
        <button
          className="btn btn-sm btn-outline-warning d-flex align-items-center"
          onClick={onChangePassword}
        >
          <KeyIcon size={14} className="me-1"/> Change Password
        </button>
      </div>
    </div>
  );
};

export default ProfileViewInfo;
