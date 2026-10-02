import { useEffect, useState } from 'react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import Icon from '../../components/Icon';
import { createComplaint, getComplaints } from '../../services/management';

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
  return (
    <div className="flex flex-col w-full space-y-space-lg">
      <div className="page-header"><div><h1 className="font-headline font-bold text-headline-xl text-on-surface">My Service Requests</h1><p className="text-body-md text-on-surface-variant">Create and track maintenance requests in real time.</p></div><button className="btn-primary" onClick={() => setOpen(true)}><Icon name="add" size={16} />New Request</button></div>
      {error && <div className="p-3 rounded-lg bg-error-container text-on-error-container text-body-sm">{error}</div>}
      <div className="space-y-3">{items.map((item) => <div key={item._id} className="section-card flex items-center justify-between gap-4"><div><div className="flex items-center gap-2"><span className="font-semibold text-primary">{item.requestNo}</span><StatusBadge status={item.priority} showIcon={false} /></div><p className="font-semibold text-on-surface mt-1">{item.title}</p><p className="text-label-sm text-on-surface-variant">{item.category} · {new Date(item.createdAt).toLocaleString('en-IN')}</p>{item.assignedStaffId && <p className="text-label-sm text-on-surface-variant mt-1">Assigned to staff</p>}</div><StatusBadge status={item.status} /></div>)}{!items.length && <div className="section-card text-center text-on-surface-variant py-12">No service requests yet.</div>}</div>
      <Modal open={open} onClose={() => setOpen(false)} title="New Service Request" size="lg" footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" form="request-form" disabled={saving}>{saving ? 'Submitting...' : 'Submit Request'}</button></>}><form id="request-form" onSubmit={submit} className="space-y-4"><div className="grid grid-cols-2 gap-4"><label className="label">Category<select className="input mt-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{['Plumbing', 'Electrical', 'Cleaning', 'Furniture', 'Wi-Fi', 'AC', 'Security', 'Other'].map((value) => <option key={value}>{value}</option>)}</select></label><label className="label">Priority<select className="input mt-1" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((value) => <option key={value}>{value}</option>)}</select></label></div><label className="label">Title<input className="input mt-1" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label><label className="label">Description<textarea className="input mt-1" rows="4" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label></form></Modal>
    </div>
  );
};

export default ResidentComplaints;
