import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';
import { getStaff, createStaff } from '../../services/management';

const Staff = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', categories: [] });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setItems(await getStaff());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    try {
      await createStaff(form);
      setAddOpen(false);
      setForm({ name: '', email: '', phone: '', password: '', categories: [] });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add staff');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleCategory = (c) => {
    setForm(prev => {
      const cats = prev.categories.includes(c)
        ? prev.categories.filter(x => x !== c)
        : [...prev.categories, c];
      return { ...prev, categories: cats };
    });
  };

  const columns = [
    {
      key: 'name', label: 'Staff Member',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-tertiary flex items-center justify-center text-on-tertiary text-label-md font-bold">
            {(row.userId?.name || '?').charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-on-surface text-body-sm">{row.userId?.name}</p>
            <p className="text-label-sm text-on-surface-variant">{row.userId?.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', label: 'Phone', render: (_, row) => row.userId?.phone },
    {
      key: 'categories', label: 'Specializations',
      render: (v) => (
        <div className="flex flex-wrap gap-1">
          {v.map((c) => (
            <span key={c} className="px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed text-label-sm font-medium">{c}</span>
          ))}
        </div>
      ),
    },
    { key: 'assigned', label: 'Active Tasks', render: (v) => <span className="font-semibold tabular-nums text-secondary">{v || 0}</span> },
    { key: 'resolved', label: 'Resolved', render: (v) => <span className="font-semibold tabular-nums text-primary">{v || 0}</span> },
    { key: 'isActive', label: 'Status', render: (_, row) => <StatusBadge status={row.userId?.isActive ? 'ACTIVE' : 'CHECKED_OUT'} /> },
    {
      key: '_id', label: '',
      render: (_, row) => (
        <button onClick={() => setSelected(row)}
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors">
          <Icon name="open_in_new" size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      <div className="page-header">
        <div>
          <h1 className="font-headline font-bold text-headline-xl text-on-surface">Staff Management</h1>
          <p className="text-body-md text-on-surface-variant">Manage service staff, categories and workload</p>
        </div>
        <button className="btn-primary" onClick={() => setAddOpen(true)}>
          <Icon name="person_add" size={18} />Add Staff
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
        {[
          { title: 'Total Staff', value: items.length, icon: 'engineering', bg: 'bg-surface-container', color: 'text-primary' },
          { title: 'Active', value: items.filter((s) => s.userId?.isActive).length, icon: 'how_to_reg', bg: 'bg-primary-fixed', color: 'text-on-primary-fixed-variant' },
          { title: 'Open Tickets', value: items.reduce((s, m) => s + (m.assigned || 0), 0), icon: 'assignment', bg: 'bg-secondary-fixed', color: 'text-on-secondary-fixed' },
          { title: 'Resolved', value: items.reduce((s, m) => s + (m.resolved || 0), 0), icon: 'task_alt', bg: 'bg-surface-container', color: 'text-primary' },
        ].map((s) => (
          <div key={s.title} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">{s.title}</span>
              <span className={`${s.bg} ${s.color} p-1.5 rounded-lg`}><Icon name={s.icon} size={18} /></span>
            </div>
            <span className="font-headline font-bold text-headline-lg text-on-surface">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="section-card">
        {loading ? (
          <div className="p-10 text-center text-on-surface-variant">Loading staff...</div>
        ) : (
          <DataTable columns={columns} data={items} emptyMessage="No staff found" emptyIcon="engineering" />
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Staff">
        <form onSubmit={handleSave} className="space-y-4">
          {error && <div className="p-3 bg-error-container text-on-error-container text-sm rounded-lg">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="label">Full Name</label><input required className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ravi Kumar" /></div>
            <div><label className="label">Email</label><input required className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="ravi@sunrise.pg" /></div>
            <div><label className="label">Phone</label><input required className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 9XXXXXXXXX" /></div>
            <div><label className="label">Password</label><input required className="input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} minLength={6} /></div>
          </div>
          <div>
            <label className="label">Specialization Categories</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {['Electrical', 'Plumbing', 'Cleaning', 'Furniture', 'Wi-Fi', 'AC', 'Water', 'Security'].map((c) => (
                <label key={c} className="flex items-center gap-1.5 cursor-pointer text-body-sm p-2 rounded border border-outline-variant hover:bg-surface-container-low transition-colors">
                  <input 
                    type="checkbox" 
                    className="accent-primary w-4 h-4"
                    checked={form.categories.includes(c)}
                    onChange={() => toggleCategory(c)}
                  />
                  {c}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" className="btn-secondary" onClick={() => setAddOpen(false)}>Cancel</button>
            <button type="submit" disabled={actionLoading} className="btn-primary">
              <Icon name="save" size={16} />{actionLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.userId?.name}>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="label">Email</p><p className="text-body-md">{selected.userId?.email}</p></div>
              <div><p className="label">Phone</p><p className="text-body-md">{selected.userId?.phone}</p></div>
              <div><p className="label">Active Tasks</p><p className="text-body-md font-bold text-secondary">{selected.assigned || 0}</p></div>
              <div><p className="label">Resolved Total</p><p className="text-body-md font-bold text-primary">{selected.resolved || 0}</p></div>
            </div>
            <div>
              <p className="label">Specializations</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {selected.categories.map((c) => (
                  <span key={c} className="px-2 py-0.5 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed text-label-sm font-semibold">{c}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Staff;
