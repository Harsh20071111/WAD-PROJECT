import { useEffect, useState } from 'react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import Icon from '../../components/Icon';
import { createResident, getResidents, bulkImportResidents } from '../../services/management';

const emptyForm = { name: '', email: '', phone: '', password: '', gender: 'OTHER', monthlyRent: '', securityDeposit: '', roomId: '', bedId: '' };

const ResidentsDirectory = () => {
  const [residents, setResidents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkCsv, setBulkCsv] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => { try { setResidents(await getResidents()); } catch (err) { setError(err.response?.data?.message || 'Unable to load residents.'); } };
  useEffect(() => { load(); const timer = setInterval(load, 10000); return () => clearInterval(timer); }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    
    if (form.password && form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    
    try {
      setLoading(true);
      await createResident({ ...form, monthlyRent: Number(form.monthlyRent), securityDeposit: Number(form.securityDeposit || 0), roomId: form.roomId || undefined, bedId: form.bedId || undefined });
      setForm(emptyForm);
      setOpen(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create resident.');
    } finally {
      setLoading(false);
    }
  };

  const submitBulk = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!bulkCsv.trim()) {
      setError('Please paste CSV data.');
      return;
    }

    try {
      setLoading(true);
      const lines = bulkCsv.split('\n').filter(line => line.trim());
      const parsed = lines.map(line => {
        const [name, email, phone, gender, monthlyRent, password] = line.split(',').map(s => s.trim());
        return { name, email, phone, gender, monthlyRent: Number(monthlyRent), password };
      });
      
      const res = await bulkImportResidents({ residents: parsed });
      alert(`Imported ${res.successful} residents. ${res.failed} failed.\n\nErrors: ${res.errors.join(', ')}`);
      setBulkOpen(false);
      setBulkCsv('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to bulk import residents.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      <div className="page-header">
        <div>
          <h1 className="font-headline font-bold text-headline-xl text-on-surface">Residents Directory</h1>
          <p className="text-body-md text-on-surface-variant">Create and manage resident accounts from the Admin dashboard.</p>
        </div>
        <div className="flex gap-2">
           <button className="btn-secondary" onClick={() => { setError(''); setBulkOpen(true); }}>
             <Icon name="upload_file" size={18} /> Bulk Import
           </button>
           <button className="btn-primary" onClick={() => { setError(''); setOpen(true); }}>
             <Icon name="person_add" size={18} /> Add Resident
           </button>
        </div>
      </div>
      
      {error && <div className="p-3 rounded-lg bg-error-container text-on-error-container text-body-sm">{error}</div>}
      
      <div className="section-card overflow-x-auto">
        <table className="w-full text-body-sm">
          <thead>
            <tr className="text-left text-label-sm text-on-surface-variant">
              <th className="p-3">Resident</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Room</th>
              <th className="p-3">Rent</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {residents.map((resident) => (
              <tr key={resident._id} className="border-t border-outline-variant/40">
                <td className="p-3">
                  <p className="font-semibold">{resident.userId?.name}</p>
                  <p className="text-label-sm text-on-surface-variant">{resident.userId?.email}</p>
                </td>
                <td className="p-3">{resident.userId?.phone || '—'}</td>
                <td className="p-3">{resident.roomId?.roomNumber || 'Unassigned'}</td>
                <td className="p-3">₹{resident.monthlyRent?.toLocaleString('en-IN')}</td>
                <td className="p-3"><StatusBadge status={resident.status} /></td>
              </tr>
            ))}
            {!residents.length && (
              <tr>
                <td colSpan="5" className="p-10 text-center text-on-surface-variant">No residents found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Add Resident Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Create Resident Account" size="lg" footer={<><button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button type="submit" form="resident-form" className="btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Resident'}</button></>}>
        <form id="resident-form" onSubmit={submit} className="grid grid-cols-2 gap-4">
          <label className="label">Full name<input className="input mt-1 w-full" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="label">Email<input className="input mt-1 w-full" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label className="label">Phone<input className="input mt-1 w-full" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label className="label">Temporary password<input className="input mt-1 w-full" required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          <label className="label">Gender<select className="input mt-1 w-full" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option>MALE</option><option>FEMALE</option><option>OTHER</option></select></label>
          <label className="label">Monthly rent<input className="input mt-1 w-full" required type="number" min="0" value={form.monthlyRent} onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })} /></label>
          <label className="label">Security deposit<input className="input mt-1 w-full" type="number" min="0" value={form.securityDeposit} onChange={(e) => setForm({ ...form, securityDeposit: e.target.value })} /></label>
        </form>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal open={bulkOpen} onClose={() => setBulkOpen(false)} title="Bulk Import Residents" size="md" footer={<><button type="button" className="btn-secondary" onClick={() => setBulkOpen(false)}>Cancel</button><button type="submit" form="bulk-form" className="btn-primary" disabled={loading}>{loading ? 'Importing...' : 'Import Data'}</button></>}>
        <form id="bulk-form" onSubmit={submitBulk} className="flex flex-col gap-4">
          <p className="text-body-sm text-on-surface-variant">Paste CSV data in the following format:<br/><code>Name, Email, Phone, Gender, MonthlyRent, Password</code></p>
          <p className="text-label-sm text-outline">Example:<br/>John Doe, john@example.com, 9876543210, MALE, 5000, password123<br/>Jane Doe, jane@example.com, 1234567890, FEMALE, 5000, securePass</p>
          <textarea className="input w-full font-mono text-sm" rows={8} value={bulkCsv} onChange={(e) => setBulkCsv(e.target.value)} placeholder="Paste CSV here..." required />
        </form>
      </Modal>
    </div>
  );
};

export default ResidentsDirectory;
