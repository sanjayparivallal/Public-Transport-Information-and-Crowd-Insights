import { UserIcon, CheckCircleIcon, PauseIcon } from '../../components/icons';

const DashboardAccountInfo = ({ profile, user }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
      <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-50">
        <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600 shadow-sm shadow-primary-100">
          <UserIcon size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-800 m-0">Account Information</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Manage your personal details and role</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-8">
        <div className="space-y-1">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Name</label>
          <div className="text-slate-800 font-black text-lg tracking-tight uppercase">{profile?.name || '—'}</div>
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Email Address</label>
          <div className="text-slate-800 font-black text-lg tracking-tight lowercase truncate">{profile?.email || user.email}</div>
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Access Level</label>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
            user.role === 'commuter' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
            user.role === 'authority' ? 'bg-amber-50 text-amber-600 border-amber-100' :
            user.role === 'driver' ? 'bg-blue-50 text-blue-600 border-blue-100' :
            'bg-purple-50 text-purple-600 border-purple-100'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              user.role === 'commuter' ? 'bg-emerald-500' :
              user.role === 'authority' ? 'bg-amber-500' :
              user.role === 'driver' ? 'bg-blue-500' :
              'bg-purple-500'
            }`}></div>
            {user.role}
          </span>
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Phone Number</label>
          <div className="text-slate-800 font-black text-lg tracking-tight">{profile?.phone || '—'}</div>
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Account Status</label>
          <div className={`flex items-center gap-2 font-black text-lg tracking-tight ${profile?.isActive !== false ? 'text-emerald-600' : 'text-slate-400'}`}>
            {profile?.isActive !== false ? (
              <><CheckCircleIcon size={20} /> <span className="uppercase">Verified Active</span></>
            ) : (
              <><PauseIcon size={20} /> <span className="uppercase">Suspended</span></>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member Since</label>
          <div className="text-slate-800 font-black text-lg tracking-tight uppercase">
            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAccountInfo;
