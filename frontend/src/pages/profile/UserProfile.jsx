import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getProfile, updateProfile } from "../../api/userApi";
import { getTransportById } from "../../api/transportApi";
import {
  UserIcon,
  EditIcon,
  CheckCircleIcon,
  BusIcon,
  TrainIcon,
  StarIcon,
  AlertIcon,
  ClipboardIcon,
  PauseIcon,
  ShieldIcon,
  SaveIcon,
  PhoneIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
} from "../../components/icons";

const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [assignedDetail, setAssignedDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await getProfile();
        const data =
          res.data?.data?.user || res.data?.user || res.data?.data || res.data;
        setProfile(data);
        setForm({
          name: data?.name || "",
          phone: data?.phone || "",
          password: "",
        });

        const assignedId =
          data?.assignedTransport?._id || data?.assignedTransport;
        if (assignedId) {
          const tRes = await getTransportById(assignedId).catch(() => null);
          if (tRes) {
            setAssignedDetail(
              tRes.data?.data?.transport || tRes.data?.data || tRes.data,
            );
          }
        }
      } catch {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleSave = async () => {
    setMsg("");
    setError("");
    setSaving(true);
    try {
      const payload = {};
      if (form.name.trim()) payload.name = form.name.trim();
      if (form.phone.trim()) payload.phone = form.phone.trim();
      if (form.password.trim()) payload.password = form.password.trim();
      const res = await updateProfile(payload);
      const updated =
        res.data?.data?.user || res.data?.user || res.data?.data || profile;
      setProfile(updated);
      setMsg("Profile updated successfully!");
      setEditing(false);
      setForm((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      setError(err.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #f0f4ff 0%, #e8eeff 100%)' }}>
        <Link to="/login" className="text-blue-600 hover:underline font-bold">
          Please login to view your profile.
        </Link>
      </div>
    );
  }

  const isStaff = user.role === "driver" || user.role === "conductor";
  const initials = (profile?.name || user.email || 'U').charAt(0).toUpperCase();

  const roleColors = {
    commuter:  'bg-blue-100 text-blue-700 border-blue-200',
    driver:    'bg-emerald-100 text-emerald-700 border-emerald-200',
    conductor: 'bg-violet-100 text-violet-700 border-violet-200',
    authority: 'bg-amber-100 text-amber-700 border-amber-200',
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Page Header (SaaS Style) ── */}
      <div className="bg-white border-b border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.01)] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-blue-600 bg-blue-50 border border-blue-100 shadow-sm shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-blue-600 font-bold uppercase tracking-widest text-[10px] mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              User Profile
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">
              {profile?.name || user.email?.split('@')[0] || 'User'}
            </h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${roleColors[user.role] || roleColors.commuter}`}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Success / Error banners */}
          {msg && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm font-semibold shadow-sm">
              <CheckCircleIcon size={18} className="shrink-0 text-emerald-500" /> {msg}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-semibold shadow-sm">
              <AlertIcon size={18} className="shrink-0 text-red-500" /> {error}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-[2rem] border border-slate-200 p-16 flex flex-col items-center justify-center shadow-sm">
              <span className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin mb-4" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading profile…</p>
            </div>
          ) : (
            <>
              {/* ── Account Information Card ── */}
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
                {/* Top border decoration */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600"></div>

                {/* Card header */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white mt-1">
                  <span className="flex items-center gap-3 font-black text-slate-900 text-xl tracking-tight">
                    <span className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <ClipboardIcon size={18} className="text-blue-600" />
                    </span>
                    Account Details
                  </span>
                  {!editing && (
                    <button
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-blue-600 border-2 border-blue-600 hover:bg-blue-50 focus:ring-4 focus:ring-blue-100 transition-all active:scale-95"
                      onClick={() => { setEditing(true); setMsg(""); setError(""); }}
                    >
                      <EditIcon size={14} /> Edit Profile
                    </button>
                  )}
                </div>

                <div className="p-8">
                  {!editing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-10">
                      {[
                        { label: 'Full Name', value: profile?.name || '—', icon: UserIcon },
                        { label: 'Email', value: profile?.email || user.email, icon: MailIcon },
                        { label: 'Phone', value: profile?.phone || '—', icon: PhoneIcon },
                        { label: 'Member Since', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—', icon: ClipboardIcon },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="flex flex-col">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Icon size={14} className="text-slate-300" /> {label}
                          </label>
                          <span className="text-slate-900 font-black text-base">{value}</span>
                        </div>
                      ))}
                      <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          Account Status
                        </label>
                        <span className={`inline-flex items-center gap-1.5 font-black w-fit text-sm ${profile?.isActive !== false ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {profile?.isActive !== false
                            ? <><CheckCircleIcon size={16} /> Active Status</>
                            : <><PauseIcon size={16} /> Inactive</>}
                        </span>
                      </div>
                      {!isStaff && (
                        <div className="flex flex-col">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <StarIcon size={14} className="text-slate-300" /> Saved Favourites
                          </label>
                          <span className="text-slate-900 font-black text-base">{(profile?.favouriteTransports || profile?.favouriteRoutes || []).length} Routes</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
                            value={form.name}
                            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          />
                        </div>
                        {/* Email (disabled) */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email (read-only)</label>
                          <input
                            type="email"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 text-slate-500 rounded-xl outline-none cursor-not-allowed font-bold"
                            value={profile?.email || ""}
                            disabled
                          />
                        </div>
                        {/* Phone */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phone</label>
                          <input
                            type="tel"
                            className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
                            value={form.phone}
                            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                          />
                        </div>
                        {/* Password */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            New Password <span className="font-normal text-slate-400 capitalize normal-case text-xs ml-1">(leave blank to keep)</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showPw ? 'text' : 'password'}
                              className="w-full px-4 py-3 pr-12 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
                              value={form.password}
                              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                              placeholder="Enter new password…"
                              autoComplete="new-password"
                            />
                            <button type="button" onClick={() => setShowPw(v => !v)}
                              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors">
                              {showPw ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-6 border-t border-slate-100">
                        <button
                          className="flex-1 inline-flex justify-center items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl text-white transition-all shadow-md bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-70"
                          onClick={handleSave}
                          disabled={saving}
                        >
                          {saving
                            ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <><SaveIcon size={16} /> Save Changes</>}
                        </button>
                        <button
                          className="px-6 py-3 border-2 border-slate-200 text-slate-500 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-all active:scale-95"
                          onClick={() => { setEditing(false); setMsg(''); setError(''); }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Security Card ── */}
              {!editing && (
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                  <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                      <ShieldIcon size={18} className="text-indigo-600" />
                    </span>
                    <span className="font-black text-slate-900 text-xl tracking-tight">Security Center</span>
                  </div>
                  <div className="px-8 py-6">
                    <p className="text-sm font-medium text-slate-500 mb-5 max-w-lg leading-relaxed">To change your password or update sensitive credential information, click Edit Profile above and secure your account.</p>
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-sm uppercase tracking-widest">
                      <CheckCircleIcon size={18} />
                      Account is active and secured
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
