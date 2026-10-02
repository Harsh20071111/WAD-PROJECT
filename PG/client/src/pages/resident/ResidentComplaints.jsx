import { useEffect, useState } from 'react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import Icon from '../../components/Icon';
import { createComplaint, getComplaints, updateComplaint } from '../../services/management';

const initialForm = { category: 'Plumbing', priority: 'MEDIUM', title: '', description: '' };

const ResidentComplaints = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const load = async () => { try { setItems(await getComplaints()); } catch (err) { setError(err.response?.data?.message || 'Unable to load requests.'); } };
  useEffect(() => { load(); const timer = setInterval(load, 10000); return () => clearInterval(timer); }, []);
  const submit = async (event) => { event.preventDefault(); setSaving(true); setError(''); try { await createComplaint(form); setForm(initialForm); setOpen(false); await load(); } catch (err) { setError(err.response?.data?.message || 'Unable to create request.'); } finally { setSaving(false); } };
  const [selected, setSelected] = useState(null);

  const resolveComplaint = async (id) => {
    setSaving(true);
    try {
      await updateComplaint(id, { status: 'RESOLVED' });
      setSelected(null);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to resolve request.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      <div className="page-header"><div><h1 className="font-headline font-bold text-headline-xl text-on-surface">My Service Requests</h1><p className="text-body-md text-on-surface-variant">Create and track maintenance requests in real time.</p></div><button className="btn-primary" onClick={() => setOpen(true)}><Icon name="add" size={16} />New Request</button></div>
      {error && <div className="p-3 rounded-lg bg-error-container text-on-error-container text-body-sm">{error}</div>}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item._id} onClick={() => setSelected(item)} className="section-card flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-container-low transition-colors">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary">{item.requestNo}</span>
                <StatusBadge status={item.priority} showIcon={false} />
              </div>
              <p className="font-semibold text-on-surface mt-1">{item.title}</p>
              <p className="text-label-sm text-on-surface-variant">{item.category} · {new Date(item.createdAt).toLocaleString('en-IN')}</p>
              {item.assignedStaffId && <p className="text-label-sm text-primary mt-1 font-medium">Assigned to {item.assignedStaffId.userId?.name}</p>}
            </div>
            <StatusBadge status={item.status} />
          </div>
        ))}
        {!items.length && <div className="section-card text-center text-on-surface-variant py-12">No service requests yet.</div>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New Service Request" size="lg" footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" form="request-form" disabled={saving}>{saving ? 'Submitting...' : 'Submit Request'}</button></>}><form id="request-form" onSubmit={submit} className="space-y-4"><div className="grid grid-cols-2 gap-4"><label className="label">Category<select className="input mt-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{['Plumbing', 'Electrical', 'Cleaning', 'Furniture', 'Wi-Fi', 'AC', 'Security', 'Other'].map((value) => <option key={value}>{value}</option>)}</select></label><label className="label">Priority<select className="input mt-1" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((value) => <option key={value}>{value}</option>)}</select></label></div><label className="label">Title<input className="input mt-1" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label><label className="label">Description<textarea className="input mt-1" rows="4" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label></form></Modal>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Request Details - ${selected?.requestNo}`}>
        {selected && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <StatusBadge status={selected.status} />
                <StatusBadge status={selected.priority} showIcon={false} />
              </div>
              <h2 className="text-headline-sm font-bold text-on-surface mb-2">{selected.title}</h2>
              <p className="text-body-md text-on-surface-variant bg-surface-container-low p-4 rounded-lg">{selected.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-body-sm">
              <div>
                <p className="text-on-surface-variant mb-1">Category</p>
                <p className="font-semibold text-on-surface">{selected.category}</p>
              </div>
              <div>
                <p className="text-on-surface-variant mb-1">Created At</p>
                <p className="font-semibold text-on-surface">{new Date(selected.createdAt).toLocaleString('en-IN')}</p>
              </div>
            </div>

            {selected.assignedStaffId && (
              <div className="bg-primary-container/20 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary">
                    <Icon name="engineering" size={20} />
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface-variant">Assigned Staff</p>
                    <p className="font-semibold text-on-surface text-body-lg">{selected.assignedStaffId.userId?.name}</p>
                  </div>
                </div>
                {selected.assignedStaffId.userId?.phone && (
                  <a href={`tel:${selected.assignedStaffId.userId.phone}`} className="btn-primary shrink-0">
                    <Icon name="call" size={18} />
                    Call Staff
                  </a>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
              <button className="btn-secondary" onClick={() => setSelected(null)}>Close</button>
              {selected.status !== 'RESOLVED' && (
                <button className="btn-primary" onClick={() => resolveComplaint(selected._id)} disabled={saving}>
                  <Icon name="check_circle" size={18} />
                  {saving ? 'Marking...' : 'Mark as Resolved'}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ResidentComplaints;
