import { LightbulbIcon } from '../../components/icons';

const DashboardGettingStarted = () => (
  <div className="bg-gradient-to-br from-primary-50/50 to-white rounded-[2.5rem] border border-primary-100 p-8 flex flex-col sm:flex-row gap-6 items-center shadow-xl shadow-primary-100/20 relative overflow-hidden group">
    {/* Decorative background element */}
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-100/20 rounded-full blur-2xl group-hover:bg-primary-200/30 transition-colors"></div>
    
    <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500">
      <LightbulbIcon size={32} />
    </div>
    <div className="text-center sm:text-left">
      <h4 className="text-xl font-black text-slate-800 mb-2 tracking-tight">Pro Tip: Getting Started</h4>
      <p className="text-slate-500 font-medium leading-relaxed mb-0 text-sm">
        Use the <strong className="font-black text-slate-800 border-b-2 border-primary-200">Search Routes</strong> page to find buses and trains between districts.
        Connect with live crowd insights, schedules, and fares — then <span className="text-rose-500 font-black">♥</span> save them
        for instant access right here on your dashboard.
      </p>
    </div>
  </div>
);

export default DashboardGettingStarted;
