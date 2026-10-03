import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';
import api from '../../services/api';

const Staff = () => {
  const [addOpen, setAddOpen]   = useState(false);
  const [selected, setSelected] = useState(null);
  
  const [staffList, setStaffList] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', categories: [] });

  const fetchStaff = async () => {
    try {
      const { data } = await api.get('/staff');
      const mapped = (data.data || []).map(staff => ({
        _id: staff._id,
        name: staff.userId?.name || '',
        email: staff.userId?.email || '',
        phone: staff.userId?.phone || '',
        isActive: staff.userId?.isActive ?? true,
        categories: staff.categories || [],
        assigned: staff.assignedTickets || 0,
        resolved: staff.resolvedTickets || 0
      }));
      setStaffList(mapped);
    } catch (err) {
      console.error("Failed to load staff", err);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async () => {
    if (!formData.name || !formData.email || !formData.password || formData.categories.length === 0) {
      alert("Please fill all required fields and select at least one category");
      return;
    }
    try {
      const { data } = await api.post('/staff', formData);
      const newStaff = {
        _id: data.data._id,
        name: data.data.userId?.name || formData.name,
        email: data.data.userId?.email || formData.email,
        phone: data.data.userId?.phone || formData.phone,
        isActive: data.data.userId?.isActive ?? true,
        categories: data.data.categories || formData.categories,
        assigned: 0,
        resolved: 0
      };
      setStaffList([newStaff, ...staffList]);
      setAddOpen(false);
      setFormData({ name: '', email: '', phone: '', password: '', categories: [] });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message);
    }
  };

  const toggleCategory = (c) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(c) 
        ? prev.categories.filter(x => x !== c) 
        : [...prev.categories, c]
    }));
  };

  const columns = [
    {
      key: 'name', label: 'Staff Member',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-tertiary flex items-center justify-center text-on-tertiary text-label-md font-bold">
            {v?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-on-surface text-body-sm">{v}</p>
            <p className="text-label-sm text-on-surface-variant">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', label: 'Phone' },
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
    { key: 'assigned', label: 'Active Tasks', render: (v) => <span className="font-semibold tabular-nums text-secondary">{v}</span> },
    { key: 'resolved', label: 'Resolved', render: (v) => <span className="font-semibold tabular-nums text-primary">{v}</span> },
    { key: 'isActive', label: 'Status', render: (v) => <StatusBadge status={v ? 'ACTIVE' : 'CHECKED_OUT'} /> },
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

      {/* Workload Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
        {[
          { title: 'Total Staff', value: staffList.length, icon: 'engineering', bg: 'bg-surface-container', color: 'text-primary' },
          { title: 'Active', value: staffList.filter((s) => s.isActive).length, icon: 'how_to_reg', bg: 'bg-primary-fixed', color: 'text-on-primary-fixed-variant' },
          { title: 'Open Tickets', value: staffList.reduce((s, m) => s + m.assigned, 0), icon: 'assignment', bg: 'bg-secondary-fixed', color: 'text-on-secondary-fixed' },
          { title: 'Resolved (All)', value: staffList.reduce((s, m) => s + m.resolved, 0), icon: 'task_alt', bg: 'bg-surface-container', color: 'text-primary' },
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
        <DataTable columns={columns} data={staffList} emptyMessage="No staff found" emptyIcon="engineering" />
      </div>

      {/* Add Staff Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Staff" size="md"
        footer={<><button className="btn-secondary" onClick={() => setAddOpen(false)}>Cancel</button><button className="btn-primary" onClick={handleAddStaff}><Icon name="save" size={16} />Save</button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" placeholder="Ravi Kumar" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="ravi@sunrise.pg" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="+91 9XXXXXXXXX" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="label">Specialization Categories</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {['Electrical', 'Plumbing', 'Cleaning', 'Furniture', 'Wi-Fi', 'AC', 'Water', 'Security'].map((c) => (
                <label key={c} className="flex items-center gap-1.5 cursor-pointer text-body-sm">
                  <input type="checkbox" className="accent-primary" checked={formData.categories.includes(c)} onChange={() => toggleCategory(c)} />
                  {c}
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name}
        footer={<><button className="btn-secondary" onClick={() => setSelected(null)}>Close</button><button className="btn-primary"><Icon name="edit" size={16} />Edit</button></>}>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="label">Email</p><p className="text-body-md">{selected.email}</p></div>
              <div><p className="label">Phone</p><p className="text-body-md">{selected.phone}</p></div>
              <div><p className="label">Active Tasks</p><p className="text-body-md font-bold text-secondary">{selected.assigned}</p></div>
              <div><p className="label">Resolved Total</p><p className="text-body-md font-bold text-primary">{selected.resolved}</p></div>
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
