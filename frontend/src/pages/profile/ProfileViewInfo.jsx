import { KeyIcon } from '../../components/icons';

const ProfileViewInfo = ({ user, profile, assignedTransportLabel, onChangePassword }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[
        { label: 'Name', value: profile?.name || '—' },
        { label: 'Email', value: profile?.email || user.email },
        { label: 'Role', value: user.role, isBadge: true },
        { label: 'Phone', value: profile?.phone || '—' },
        { label: 'Organisation', value: profile?.organizationName, condition: !!profile?.organizationName },
        { label: 'Region', value: profile?.region, condition: !!profile?.region },
        { label: 'Contact Email', value: profile?.contactEmail, condition: !!profile?.contactEmail },
        { label: 'Contact Phone', value: profile?.contactPhone, condition: !!profile?.contactPhone },
        { label: 'Office Address', value: profile?.officeAddress, condition: !!profile?.officeAddress, fullWidth: true },
        { label: 'Assigned Transport', value: assignedTransportLabel, condition: !!assignedTransportLabel, fullWidth: true },
      ].map((item, idx) => (
        (!Object.prototype.hasOwnProperty.call(item, 'condition') || item.condition) && (
          <div key={idx} className={`flex flex-col space-y-1.5 ${item.fullWidth ? 'md:col-span-2' : ''}`}>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{item.label}</label>
            {item.isBadge ? (
              <span className="w-max px-3 py-1 rounded-full text-xs font-black bg-primary-50 text-blue-600 border border-primary-100 uppercase tracking-wider capitalize">
                {item.value}
              </span>
            ) : (
              <span className="text-lg font-bold text-slate-700 ml-1">{item.value}</span>
            )}
          </div>
        )
      ))}

      {profile?.coveredDistricts?.length > 0 && (
        <div className="flex flex-col md:col-span-2 space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Covered Districts</label>
          <div className="flex flex-wrap gap-2">
            {profile.coveredDistricts.map(d => (
              <span key={d} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200">
                {d}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="md:col-span-2 mt-4 pt-8 border-t border-slate-100">
        <button
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl transition-all shadow-lg shadow-slate-200 active:scale-95"
          onClick={onChangePassword}
        >
          <KeyIcon size={18}/> Change Security Password
        </button>
      </div>
    </div>
  );
};

export default ProfileViewInfo;
