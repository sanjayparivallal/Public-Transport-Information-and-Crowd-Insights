import { SaveIcon } from '../../components/icons';

const ProfileEditForm = ({ user, form, setForm, onSave, onCancel, saving }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all placeholder-slate-400 font-bold text-slate-700"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="Your name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
          <input
            type="tel"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all placeholder-slate-400 font-bold text-slate-700"
            value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            placeholder="+91 00000 00000"
          />
        </div>

        {user.role === 'authority' && (
          <>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Contact Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all placeholder-slate-400 font-bold text-slate-700"
                value={form.contactEmail}
                onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
              <input
                type="tel"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all placeholder-slate-400 font-bold text-slate-700"
                value={form.contactPhone}
                onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Office Address</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all placeholder-slate-400 font-bold text-slate-700"
                value={form.officeAddress}
                onChange={e => setForm(p => ({ ...p, officeAddress: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Covered Districts (comma separated)</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all placeholder-slate-400 font-bold text-slate-700"
                value={form.coveredDistricts}
                onChange={e => setForm(p => ({ ...p, coveredDistricts: e.target.value }))}
                placeholder="District A, District B..."
              />
            </div>
          </>
        )}
      </div>

      <div className="flex gap-4 pt-8 border-t border-slate-100">
        <button 
          className="flex-1 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-primary-200 active:scale-95 flex items-center justify-center gap-2"
          onClick={onSave} 
          disabled={saving}
        >
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><SaveIcon size={18}/> Update Profile Details</>}
        </button>
        <button 
          className="px-8 py-3 border-2 border-slate-100 text-slate-400 hover:text-slate-600 font-black rounded-2xl transition-all active:scale-95"
          onClick={onCancel}
        >
          Discard
        </button>
      </div>
    </div>
  );
};

export default ProfileEditForm;
