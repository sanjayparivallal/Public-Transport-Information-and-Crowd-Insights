import { SaveIcon } from '../../components/icons';

const ProfileEditForm = ({ user, form, setForm, onSave, onCancel, saving }) => {
  return (
    <div>
      <div className="mb-3">
        <label className="form-label">Name</label>
        <input type="text" className="form-control" value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
      </div>
      <div className="mb-3">
        <label className="form-label">Phone</label>
        <input type="tel" className="form-control" value={form.phone}
          onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
      </div>

      {user.role === 'authority' && (
        <>
          <div className="mb-3">
            <label className="form-label">Contact Email</label>
            <input type="email" className="form-control" value={form.contactEmail}
              onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))} />
          </div>
          <div className="mb-3">
            <label className="form-label">Contact Phone</label>
            <input type="tel" className="form-control" value={form.contactPhone}
              onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))} />
          </div>
          <div className="mb-3">
            <label className="form-label">Office Address</label>
            <input type="text" className="form-control" value={form.officeAddress}
              onChange={e => setForm(p => ({ ...p, officeAddress: e.target.value }))} />
          </div>
          <div className="mb-3">
            <label className="form-label">Covered Districts (comma separated)</label>
            <input type="text" className="form-control" value={form.coveredDistricts}
              onChange={e => setForm(p => ({ ...p, coveredDistricts: e.target.value }))} />
          </div>
        </>
      )}

      <div className="d-flex gap-2">
        <button className="btn btn-primary flex-fill d-flex align-items-center justify-content-center" onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : <><SaveIcon size={18} className="me-1"/> Save Profile</>}
        </button>
        <button className="btn btn-outline-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default ProfileEditForm;
