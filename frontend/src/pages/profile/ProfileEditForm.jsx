import { SaveIcon } from '../../components/icons';

const ProfileEditForm = ({ user, form, setForm, onSave, onCancel, saving }) => {
  return (
    <div className="space-y-8 animate-in fade-in flex flex-col pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all placeholder-slate-400 font-bold text-slate-900"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="Your name"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
          <input
            type="tel"
            className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all placeholder-slate-400 font-bold text-slate-900"
            value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            placeholder="+91 00000 00000"
          />
        </div>

        {user.role === 'authority' && (
          <>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all placeholder-slate-400 font-bold text-slate-900"
                value={form.contactEmail}
                onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))}
                placeholder="authority@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact Phone</label>
              <input
                type="tel"
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all placeholder-slate-400 font-bold text-slate-900"
                value={form.contactPhone}
                onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))}
                placeholder="Office Phone"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Office Address</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all placeholder-slate-400 font-bold text-slate-900"
                value={form.officeAddress}
                onChange={e => setForm(p => ({ ...p, officeAddress: e.target.value }))}
                placeholder="Headquarters Address"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Covered Districts</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all placeholder-slate-400 font-bold text-slate-900"
                value={form.coveredDistricts}
                onChange={e => setForm(p => ({ ...p, coveredDistricts: e.target.value }))}
                placeholder="District A, District B..."
              />
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
