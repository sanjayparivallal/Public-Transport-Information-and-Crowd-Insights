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
} from "../../components/icons";

/**
 * UserProfile.jsx
 * Profile page for commuter, driver, and conductor roles.
 * Displays personal info, assigned transport (for staff), favourites count,
 * and allows editing name / phone / password.
 *
 * Route: to be wired by routing teammate (e.g. /profile/user)
 */
const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [assignedDetail, setAssignedDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
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
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
        <Link to="/login" className="text-blue-600 hover:underline">
          Please login to view your profile.
        </Link>
      </div>
    );
  }

  const isStaff = user.role === "driver" || user.role === "conductor";
  const assignedTransportFallback = profile?.assignedTransport
    ? typeof profile.assignedTransport === "object"
      ? profile.assignedTransport._id ||
        profile.assignedTransport.transportNumber ||
        "—"
      : String(profile.assignedTransport)
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="flex items-center text-2xl sm:text-3xl font-bold text-slate-900">
            <UserIcon size={32} className="mr-3 text-blue-600" /> User Profile
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            View and update your personal account information
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          {msg && (
            <div className="mb-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg p-4 flex items-center text-sm font-medium">
              <CheckCircleIcon size={18} className="mr-2 shrink-0" /> {msg}
            </div>
          )}
          {error && (
            <div className="mb-4 bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 flex items-center text-sm font-medium">
              <AlertIcon size={18} className="mr-2 shrink-0" /> {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Account Information */}
              <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <span className="flex items-center font-bold text-slate-800 text-lg">
                    <ClipboardIcon size={20} className="mr-2 text-blue-600" />{" "}
                    Account Information
                  </span>
                  {!editing && (
                    <button
                      className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors"
                      onClick={() => {
                        setEditing(true);
                        setMsg("");
                        setError("");
                      }}
                    >
                      <EditIcon size={14} className="mr-1.5" /> Edit
                    </button>
                  )}
                </div>

                <div className="p-6">
                  {!editing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Name
                        </label>
                        <span className="text-slate-900 font-medium">
                          {profile?.name || "—"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Email
                        </label>
                        <span className="text-slate-900 font-medium">
                          {profile?.email || user.email}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Role
                        </label>
                        <span>
                          <span className="inline-flex py-1 px-2.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 capitalize">
                            {user.role}
                          </span>
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Phone
                        </label>
                        <span className="text-slate-900 font-medium">
                          {profile?.phone || "—"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Account Status
                        </label>
                        <span
                          className={`font-bold flex items-center ${profile?.isActive !== false ? "text-emerald-600" : "text-slate-400"}`}
                        >
                          {profile?.isActive !== false ? (
                            <>
                              <CheckCircleIcon size={16} className="mr-1.5" />{" "}
                              Active
                            </>
                          ) : (
                            <>
                              <PauseIcon size={16} className="mr-1.5" />{" "}
                              Inactive
                            </>
                          )}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Member Since
                        </label>
                        <span className="text-slate-900 font-medium">
                          {profile?.createdAt
                            ? new Date(profile.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )
                            : "—"}
                        </span>
                      </div>
                      {!isStaff && (
                        <div className="flex flex-col">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Saved Favourites
                          </label>
                          <span className="text-slate-900 font-medium">
                            {(profile?.favouriteTransports || []).length}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                          value={form.name}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, name: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          className="w-full px-4 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg outline-none cursor-not-allowed"
                          value={profile?.email || ""}
                          disabled
                        />
                        <div className="mt-1 text-xs text-slate-500">
                          Email cannot be changed.
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                          value={form.phone}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, phone: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          New Password{" "}
                          <span className="font-normal text-slate-400">
                            (leave blank to keep current)
                          </span>
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                          value={form.password}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, password: e.target.value }))
                          }
                          placeholder="Enter new password…"
                          autoComplete="new-password"
                        />
                      </div>
                      <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button
                          className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-70"
                          onClick={handleSave}
                          disabled={saving}
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          className="px-4 py-2 border border-slate-300 text-sm font-bold rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                          onClick={() => {
                            setEditing(false);
                            setMsg("");
                            setError("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
