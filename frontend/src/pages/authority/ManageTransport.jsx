import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getManagedTransports,
  createTransport,
  updateTransport,
  deleteTransport,
  assignStaff,
  removeStaff,
} from '../../api/adminApi';
import { BusIcon, TrainIcon, EditIcon, CheckCircleIcon, UserIcon, WrenchIcon, AlertIcon, SearchIcon, ClipboardIcon, BuildingIcon, TrashIcon, MapIcon } from '../../components/icons';
import TransportRoutesModal from './TransportRoutesModal';

/* ── Helpers ─────────────────────────────────────────────── */
const EMPTY_FORM = {
  transportNumber: '',
  name: '',
  type: 'bus',
  operator: '',
  vehicleNumber: '',
  totalSeats: '',
  amenities: '',
};

const formFromTransport = (t) => ({
  transportNumber: t.transportNumber || '',
  name: t.name || '',
  type: t.type || 'bus',
  operator: t.operator || '',
  vehicleNumber: t.vehicleNumber || '',
  totalSeats: t.totalSeats != null ? String(t.totalSeats) : '',
  amenities: (t.amenities || []).join(', '),
});

const toPayload = (form) => {
  const p = {
    transportNumber: form.transportNumber.trim(),
    name: form.name.trim(),
    type: form.type,
  };
  if (form.operator.trim())     p.operator      = form.operator.trim();
  if (form.vehicleNumber.trim()) p.vehicleNumber = form.vehicleNumber.trim();
  if (form.totalSeats.trim())   p.totalSeats    = Number(form.totalSeats);
  if (form.amenities.trim()) {
    p.amenities = form.amenities.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return p;
};

/* ── Sub-components ──────────────────────────────────────── */
const StatusBadge = ({ isActive }) => (
  <span
    className="severity-badge"
    style={{
      background: isActive !== false ? '#d1fae5' : '#f1f5f9',
      color: isActive !== false ? '#065f46' : '#64748b',
    }}
  >
    {isActive !== false ? 'Active' : 'Inactive'}
  </span>
);

const TypeChip = ({ type }) => (
  <span className={`meta-chip ${type} d-flex align-items-center d-inline-flex`}>
    {type === 'bus' ? <BusIcon size={14} className="me-1"/> : <TrainIcon size={14} className="me-1"/>} <span style={{ textTransform: 'capitalize' }}>{type}</span>
  </span>
);

/* ── Transport Form Modal (create / edit) ─────────────────── */
const TransportFormModal = ({ modalId, transport, onSaved }) => {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    setForm(transport ? formFromTransport(transport) : EMPTY_FORM);
    setError('');
  }, [transport]);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.transportNumber.trim() || !form.name.trim()) {
      setError('Transport Number and Name are required.');
      return;
    }
    try {
      setSaving(true);
      const payload = toPayload(form);
      if (transport) {
        await updateTransport(transport._id, payload);
      } else {
        await createTransport(payload);
      }
      // Close modal via Bootstrap JS
      const modalEl = document.getElementById(modalId);
      if (modalEl && window.bootstrap) {
        window.bootstrap.Modal.getInstance(modalEl)?.hide();
      }
      onSaved();
    } catch (err) {
      setError(err.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal fade" id={modalId} tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content" style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div className="modal-header" style={{ borderBottom: '1px solid var(--border)' }}>
            <h5 className="modal-title fw-bold d-flex align-items-center">
              {transport ? <><EditIcon size={20} className="me-2"/> Edit Transport</> : 'Add New Transport'}
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert-custom alert-error mb-3 d-flex align-items-center"><AlertIcon size={18} className="me-2"/> {error}</div>
              )}
              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="form-label">Transport Number <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. SLM-001"
                    value={form.transportNumber}
                    onChange={set('transportNumber')}
                    required
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Salem–Chennai Express"
                    value={form.name}
                    onChange={set('name')}
                    required
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={form.type} onChange={set('type')}>
                    <option value="bus">Bus</option>
                    <option value="train">Train</option>
                  </select>
                </div>
                <div className="col-sm-6">
                  <label className="form-label">Operator</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. TNSTC"
                    value={form.operator}
                    onChange={set('operator')}
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">Vehicle / Registration No.</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. TN 33 AB 1234"
                    value={form.vehicleNumber}
                    onChange={set('vehicleNumber')}
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">Total Seats</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 52"
                    min="1"
                    value={form.totalSeats}
                    onChange={set('totalSeats')}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">
                    Amenities
                    <span style={{ color: '#94a3b8', fontWeight: 400 }}> (comma-separated, e.g. AC, WiFi, Sleeper)</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="AC, WiFi, Sleeper"
                    value={form.amenities}
                    onChange={set('amenities')}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid var(--border)' }}>
              <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary px-4 d-flex align-items-center" disabled={saving}>
                {saving
                  ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</>
                  : (transport ? 'Save Changes' : 'Add Transport')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ── Assign Staff Modal ──────────────────────────────────── */
const AssignStaffModal = ({ transport, onSaved }) => {
  const [email, setEmail]   = useState('');
  const [role, setRole]     = useState('driver');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setEmail(''); setRole('driver'); setError(''); setSuccess('');
  }, [transport]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!email.trim()) { setError('Email is required.'); return; }
    try {
      setSaving(true);
      await assignStaff(transport._id, { email: email.trim(), assignRole: role });
      setSuccess(`✅ Assigned ${role} successfully!`);
      setEmail('');
      onSaved();
    } catch (err) {
      setError(err.message || 'Assignment failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal fade" id="assignStaffModal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div className="modal-header" style={{ borderBottom: '1px solid var(--border)' }}>
            <h5 className="modal-title fw-bold d-flex align-items-center"><UserIcon size={20} className="me-2"/> Assign Staff</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {transport && (
                <div className="mb-3 p-2 rounded" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  Transport: <strong>{transport.name} (#{transport.transportNumber})</strong>
                </div>
              )}
              {error   && <div className="alert-custom alert-error   mb-3 d-flex align-items-center"><AlertIcon size={18} className="me-2"/> {error}</div>}
              {success && <div className="alert-custom alert-success mb-3 d-flex align-items-center"><CheckCircleIcon size={18} className="me-2"/> {success}</div>}
              <div className="mb-3">
                <label className="form-label">Commuter Email <span className="text-danger">*</span></label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="commuter@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="form-text">The commuter's role will be updated to the assigned role.</div>
              </div>
              <div className="mb-3">
                <label className="form-label">Assign As</label>
                <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="driver">Driver</option>
                  <option value="conductor">Conductor / TTR</option>
                </select>
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid var(--border)' }}>
              <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
              <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                {saving
                  ? <><span className="spinner-border spinner-border-sm me-2" />Assigning…</>
                  : 'Assign Staff'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ── Delete Confirmation Modal ───────────────────────────── */
const DeleteModal = ({ transport, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => { setError(''); }, [transport]);

  const handleDelete = async () => {
    if (!transport) return;
    try {
      setDeleting(true);
      await deleteTransport(transport._id);
      const modalEl = document.getElementById('deleteModal');
      if (modalEl && window.bootstrap) {
        window.bootstrap.Modal.getInstance(modalEl)?.hide();
      }
      onDeleted();
    } catch (err) {
      setError(err.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal fade" id="deleteModal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div className="modal-header" style={{ borderBottom: '1px solid var(--border)' }}>
            <h5 className="modal-title fw-bold text-danger d-flex align-items-center"><AlertIcon size={20} className="me-2"/> Delete Transport</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" />
          </div>
          <div className="modal-body">
            {error && <div className="alert-custom alert-error mb-3 d-flex align-items-center"><AlertIcon size={18} className="me-2"/> {error}</div>}
            {transport && (
              <p style={{ color: 'var(--text)' }}>
                Are you sure you want to delete{' '}
                <strong>{transport.name} (#{transport.transportNumber})</strong>?
                This action cannot be undone.
              </p>
            )}
          </div>
          <div className="modal-footer" style={{ borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
            <button
              type="button"
              className="btn btn-danger px-4 d-flex align-items-center"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting
                ? <><span className="spinner-border spinner-border-sm me-2" />Deleting…</>
                : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ───────────────────────────────────────────── */
const ManageTransport = () => {
  const { user, isAuthority } = useAuth();
  const navigate               = useNavigate();

  const [transports, setTransports]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [typeFilter, setTypeFilter]     = useState('all');

  // Selection for modals
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [assignTarget,      setAssignTarget]       = useState(null);
  const [deleteTarget,      setDeleteTarget]       = useState(null);
  const [routeTarget,       setRouteTarget]        = useState(null);

  const fetchTransports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getManagedTransports();
      // /transport/mine returns { success, data: { transports: [...], total } }
      const d = res.data?.data || res.data;
      setTransports(d?.transports || (Array.isArray(d) ? d : []));
    } catch (err) {
      setError(err.message || 'Failed to load transports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTransports(); }, [fetchTransports]);

  const handleRemoveStaff = async (transportId, role) => {
    if (!window.confirm(`Are you sure you want to remove the ${role}?`)) return;
    try {
      await removeStaff(transportId, role);
      fetchTransports(); // Refresh list to show empty staff
    } catch (err) {
      setError(err.message || `Failed to remove ${role}`);
    }
  };

  const openAddModal = () => {
    setSelectedTransport(null);
    const modalEl = document.getElementById('transportFormModal');
    if (modalEl && window.bootstrap) {
      new window.bootstrap.Modal(modalEl).show();
    }
  };

  const openEditModal = (t) => {
    setSelectedTransport(t);
    // slight delay to let state settle
    setTimeout(() => {
      const modalEl = document.getElementById('transportFormModal');
      if (modalEl && window.bootstrap) {
        new window.bootstrap.Modal(modalEl).show();
      }
    }, 50);
  };

  const openAssignModal = (t) => {
    setAssignTarget(t);
    setTimeout(() => {
      const modalEl = document.getElementById('assignStaffModal');
      if (modalEl && window.bootstrap) {
        new window.bootstrap.Modal(modalEl).show();
      }
    }, 50);
  };

  const openRoutesModal = (t) => {
    setRouteTarget(t);
    setTimeout(() => {
      const modalEl = document.getElementById('transportRoutesModal');
      if (modalEl && window.bootstrap) {
        new window.bootstrap.Modal(modalEl).show();
      }
    }, 50);
  };

  const openDeleteModal = (t) => {
    setDeleteTarget(t);
    setTimeout(() => {
      const modalEl = document.getElementById('deleteModal');
      if (modalEl && window.bootstrap) {
        new window.bootstrap.Modal(modalEl).show();
      }
    }, 50);
  };

  // Access guard
  if (!user || !isAuthority) {
    return (
      <div className="container py-5 text-center">
        <div className="empty-state">
          <div className="empty-state-icon text-muted"><AlertIcon size={48} /></div>
          <h3>Access Restricted</h3>
          <p style={{ color: '#64748b' }}>Only Transport Authorities can access this page.</p>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/login')}>
            Login as Authority
          </button>
        </div>
      </div>
    );
  }

  // Filtered list
  const filtered = transports.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      t.name?.toLowerCase().includes(q) ||
      t.transportNumber?.toLowerCase().includes(q) ||
      t.operator?.toLowerCase().includes(q);
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    return matchSearch && matchType;
  });

  const stats = {
    total:    transports.length,
    active:   transports.filter((t) => t.isActive !== false).length,
    buses:    transports.filter((t) => t.type === 'bus').length,
    trains:   transports.filter((t) => t.type === 'train').length,
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="container d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h1 className="d-flex align-items-center"><WrenchIcon size={32} className="me-2"/> Manage Transports</h1>
            <p>Add, edit, and manage buses and trains under your authority</p>
          </div>
          <button className="btn btn-light fw-semibold px-4" onClick={openAddModal}>
            Add Transport
          </button>
        </div>
      </div>

      <div className="container pb-5">

        {/* Error */}
        {error && (
          <div className="alert-custom alert-error mb-4 d-flex align-items-center"><AlertIcon size={18} className="me-2"/> {error}</div>
        )}

        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Total Transports', value: stats.total,  color: 'var(--primary)' },
            { label: 'Active',           value: stats.active, color: 'var(--success)' },
            { label: 'Buses',            value: stats.buses,  color: '#1d4ed8' },
            { label: 'Trains',           value: stats.trains, color: '#7c3aed' },
          ].map(({ label, value, color }) => (
            <div className="col-sm-6 col-lg-3" key={label}>
              <div className="detail-section text-center py-4" style={{ marginBottom: 0 }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: '.82rem', color: '#64748b', marginTop: '.25rem' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="detail-section">
          <div className="row g-3 align-items-end">
            <div className="col-sm-8 col-md-6">
              <label className="form-label d-flex align-items-center"><SearchIcon size={16} className="me-1"/> Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, number, or operator…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-sm-4 col-md-3">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="bus">Bus</option>
                <option value="train">Train</option>
              </select>
            </div>
            <div className="col-md-3 ms-auto text-end">
              <button className="btn btn-primary w-100" onClick={openAddModal}>
                Add Transport
              </button>
            </div>
          </div>
        </div>

        {/* Transport List */}
        <div className="detail-section" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            className="d-flex align-items-center justify-content-between px-3 py-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <span style={{ fontWeight: 700, fontSize: '.95rem' }} className="d-flex align-items-center">
              <ClipboardIcon size={18} className="me-2"/> Transport List
            </span>
            <span className="result-count">{filtered.length} transport{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner-large" />
              <p>Loading transports…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" style={{ color: '#3b82f6' }}><BusIcon size={48} /></div>
              <h4>
                {transports.length === 0
                  ? 'No transports yet'
                  : 'No results found'}
              </h4>
              <p style={{ color: '#64748b', fontSize: '.9rem' }}>
                {transports.length === 0
                  ? 'Click "Add Transport" to create your first bus or train.'
                  : 'Try adjusting your search or filter.'}
              </p>
              {transports.length === 0 && (
                <button className="btn btn-primary mt-3" onClick={openAddModal}>
                  Add Transport
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead>
                  <tr style={{ background: '#f8fafc', fontSize: '.82rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                    <th className="px-3 py-3" style={{ fontWeight: 700 }}>Number</th>
                    <th className="py-3" style={{ fontWeight: 700 }}>Name &amp; Operator</th>
                    <th className="py-3" style={{ fontWeight: 700 }}>Type</th>
                    <th className="py-3" style={{ fontWeight: 700 }}>Seats</th>
                    <th className="py-3" style={{ fontWeight: 700 }}>Status</th>
                    <th className="py-3 text-end pe-3" style={{ fontWeight: 700 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-3 py-3">
                        <span className="transport-number">{t.transportNumber}</span>
                      </td>
                      <td className="py-3">
                        <div style={{ fontWeight: 700, fontSize: '.95rem' }}>{t.name || '—'}</div>
                        {t.operator && (
                          <div className="d-flex align-items-center" style={{ fontSize: '.8rem', color: '#64748b' }}><BuildingIcon size={14} className="me-1"/> {t.operator}</div>
                        )}
                        {t.vehicleNumber && (
                          <div style={{ fontSize: '.78rem', color: '#94a3b8' }}>{t.vehicleNumber}</div>
                        )}
                        {t.assignedDriver && (
                          <div style={{ fontSize: '.8rem', color: '#16a34a', marginTop: '4px' }} className="d-flex align-items-center gap-1">
                            Driver: {t.assignedDriver.name}
                            <button className="btn btn-sm btn-link p-0 ms-1 d-flex align-items-center" onClick={() => handleRemoveStaff(t._id, 'driver')} title="Unassign Driver" style={{ color: '#ef4444' }}><AlertIcon size={14}/></button>
                          </div>
                        )}
                        {t.assignedConductor && (
                          <div style={{ fontSize: '.8rem', color: '#0284c7', marginTop: '2px' }} className="d-flex align-items-center gap-1">
                            Cond: {t.assignedConductor.name}
                            <button className="btn btn-sm btn-link p-0 ms-1 d-flex align-items-center" onClick={() => handleRemoveStaff(t._id, 'conductor')} title="Unassign Conductor" style={{ color: '#ef4444' }}><AlertIcon size={14}/></button>
                          </div>
                        )}
                      </td>
                      <td className="py-3">
                        <TypeChip type={t.type} />
                      </td>
                      <td className="py-3">
                        <span style={{ fontSize: '.88rem', color: 'var(--text)' }}>
                          {t.totalSeats ?? '—'}
                        </span>
                      </td>
                      <td className="py-3">
                        <StatusBadge isActive={t.isActive} />
                        {(t.amenities || []).length > 0 && (
                          <div className="mt-1 d-flex flex-wrap gap-1">
                            {t.amenities.map((a, i) => (
                              <span key={i} style={{ fontSize: '.7rem', background: '#f1f5f9', color: '#64748b', padding: '.1rem .4rem', borderRadius: 4 }}>
                                {a}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 pe-3 text-end">
                        <div className="d-flex gap-2 justify-content-end flex-wrap">
                          <Link
                            to={`/transport/${t._id}`}
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                            title="View Details"
                          >
                            <SearchIcon size={14} className="me-1"/> View
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-primary d-flex align-items-center"
                            onClick={() => openEditModal(t)}
                            title="Edit Transport"
                          >
                            <EditIcon size={14} className="me-1"/> Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success d-flex align-items-center"
                            onClick={() => openAssignModal(t)}
                            title="Assign Driver / Conductor"
                          >
                            <UserIcon size={14} className="me-1"/> Staff
                          </button>
                          <button
                            className="btn btn-sm btn-outline-info d-flex align-items-center"
                            onClick={() => openRoutesModal(t)}
                            title="Manage Routes & Fares"
                          >
                            <MapIcon size={14} className="me-1"/> Routes
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger d-flex align-items-center"
                            onClick={() => openDeleteModal(t)}
                            title="Delete Transport"
                          >
                            <TrashIcon size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Modals */}
      <TransportFormModal
        modalId="transportFormModal"
        transport={selectedTransport}
        onSaved={fetchTransports}
      />
      <AssignStaffModal
        transport={assignTarget}
        onSaved={fetchTransports}
      />
      <TransportRoutesModal
        transport={routeTarget}
      />
      <DeleteModal
        transport={deleteTarget}
        onDeleted={fetchTransports}
      />
    </>
  );
};

export default ManageTransport;
