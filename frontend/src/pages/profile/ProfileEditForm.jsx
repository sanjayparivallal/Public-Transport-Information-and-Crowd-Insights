import { SaveIcon } from '../../components/icons';

const ProfileEditForm = ({ user, form, setForm, onSave, onCancel, saving }) => {
  return (
    <div className="space-y-8 animate-in fade-in flex flex-col pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="floating-group">
          <input
            type="text" id="profileName"
            className="floating-input"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="Full Name"
          />
          <label htmlFor="profileName" className="floating-label">Full Name</label>
        </div>
        <div className="floating-group">
          <input
            type="tel" id="profilePhone"
            className="floating-input"
            value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            placeholder="Phone Number"
          />
          <label htmlFor="profilePhone" className="floating-label">Phone Number</label>
        </div>

        {user.role === 'authority' && (
          <>
            <div className="floating-group">
              <input
                type="email" id="contactEmail"
                className="floating-input"
                value={form.contactEmail}
                onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))}
                placeholder="authority@example.com"
              />
              <label htmlFor="contactEmail" className="floating-label">Contact Email</label>
            </div>
            <div className="floating-group">
              <input
                type="tel" id="contactPhone"
                className="floating-input"
                value={form.contactPhone}
                onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))}
                placeholder="Office Phone"
              />
              <label htmlFor="contactPhone" className="floating-label">Contact Phone</label>
            </div>
            <div className="floating-group md:col-span-2">
              <input
                type="text" id="officeAddress"
                className="floating-input"
                value={form.officeAddress}
                onChange={e => setForm(p => ({ ...p, officeAddress: e.target.value }))}
                placeholder="Headquarters Address"
              />
              <label htmlFor="officeAddress" className="floating-label">Office Address</label>
            </div>
            <div className="floating-group md:col-span-2">
              <input
                type="text" id="coveredDistricts"
                className="floating-input"
                value={form.coveredDistricts}
                onChange={e => setForm(p => ({ ...p, coveredDistricts: e.target.value }))}
                placeholder="District A, District B..."
              />
              <label htmlFor="coveredDistricts" className="floating-label">Covered Districts</label>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-4 pt-6 border-t border-slate-100">
        <button 
          className="flex-1 inline-flex justify-center items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl text-white transition-all shadow-md bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-70"
          onClick={onSave} 
          disabled={saving}
        >
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><SaveIcon size={16}/> Save Updates</>}
        </button>
        <button 
          className="px-6 py-3 border-2 border-slate-200 text-slate-500 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-all active:scale-95"
          onClick={onCancel}
        >
          Discard
        </button>
      </div>
    </div>
  );
};

export default ProfileEditForm;
