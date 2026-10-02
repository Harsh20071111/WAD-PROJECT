import { useState } from 'react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';

const MOCK = [
  { _id: '1', requestNo: 'REQ1001', resident: 'Priya Sharma', room: '103-C', category: 'Electrical', priority: 'HIGH', title: 'Fan not working', description: 'The ceiling fan in the room has stopped working completely since yesterday.', status: 'ASSIGNED', assignedTo: 'Ravi Kumar', createdAt: '2026-10-01' },
  { _id: '2', requestNo: 'REQ1002', resident: 'Arjun Mehta', room: '203-C', category: 'Plumbing', priority: 'URGENT', title: 'Water leakage', description: 'There is water leaking from under the bathroom basin.', status: 'IN_PROGRESS', assignedTo: 'Ravi Kumar', createdAt: '2026-10-02' },
  { _id: '3', requestNo: 'REQ1003', resident: 'Priya Sharma', room: '103-C', category: 'Wi-Fi', priority: 'MEDIUM', title: 'Internet very slow', description: 'WiFi speed dropped drastically after 8PM every day.', status: 'NEW', assignedTo: null, createdAt: '2026-10-03' },
  { _id: '4', requestNo: 'REQ1004', resident: 'Arjun Mehta', room: '203-C', category: 'Cleaning', priority: 'LOW', title: 'Common area dirty', description: 'The corridor on Floor 2 has not been cleaned for 2 days.', status: 'RESOLVED', assignedTo: 'Suresh Nair', createdAt: '2026-09-28' },
];

const TRANSITIONS = {
  NEW: ['ASSIGNED'],
  ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['ON_HOLD', 'RESOLVED'],
  ON_HOLD: ['IN_PROGRESS'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
};

const Complaints = () => {
  const [tab, setTab]           = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [newOpen, setNewOpen]   = useState(false);

  const tabs = ['ALL', 'NEW', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED'];
  const filtered = tab === 'ALL' ? MOCK : MOCK.filter((c) => c.status === tab);

  const priorityIcon = { LOW: 'south', MEDIUM: 'remove', HIGH: 'north', URGENT: 'priority_high' };
  const priorityColor = { LOW: 'text-on-surface-variant', MEDIUM: 'text-tertiary', HIGH: 'text-secondary', URGENT: 'text-error' };

  const columns = [
    {
      key: 'requestNo', label: 'Req #',
      render: (v) => <span className="font-semibold text-primary text-label-md">{v}</span>,
    },
    {
      key: 'resident', label: 'Resident',
      render: (v, row) => (
        <div>
          <p className="font-medium text-on-surface text-body-sm">{v}</p>
          <p className="text-label-sm text-on-surface-variant">{row.room}</p>
        </div>
      ),
    },
    { key: 'category', label: 'Category' },
    {
      key: 'priority', label: 'Priority',
      render: (v) => (
        <span className={`flex items-center gap-1 font-semibold text-label-sm ${priorityColor[v]}`}>
          <Icon name={priorityIcon[v]} size={14} />{v}
        </span>
      ),
    },
    {
      key: 'title', label: 'Issue',
      render: (v, row) => (
        <div>
          <p className="text-on-surface font-medium text-body-sm">{v}</p>
          <p className="text-label-sm text-on-surface-variant truncate max-w-[200px]">{row.description}</p>
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'assignedTo', label: 'Assigned To', render: (v) => v || <span className="text-outline italic">Unassigned</span> },
    {
      key: 'createdAt', label: 'Raised',
      render: (v) => new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    },
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
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-label-sm font-semibold uppercase tracking-wider">SLA Monitor</span>
            <span className="text-on-surface-variant text-label-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping inline-block" /> Live Dispatch Desk
            </span>
          </div>
          <h1 className="font-headline font-bold text-headline-xl text-on-surface">Service Requests & Maintenance</h1>
          <p className="text-body-md text-on-surface-variant">Track complaints, assign staff, enforce SLAs and monitor resolution ratings</p>
        </div>
        <div className="flex items-center gap-space-sm">
          <button className="btn-secondary"><Icon name="engineering" size={18} />Manage Staff</button>
          <button className="btn-primary" onClick={() => setNewOpen(true)}><Icon name="add_circle" size={18} />Log Complaint</button>
        </div>
      </div>

      {/* Metric strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
        <StatCard title="Breach Risk (<4h)" value={<span className="text-error">03</span>} icon="alarm" iconBg="bg-error-container" iconColor="text-on-error-container" subtitle="Immediate action" />
        <StatCard title="Unassigned Queue" value="03" icon="assignment_late" iconBg="bg-secondary-fixed" iconColor="text-on-secondary-fixed" subtitle="Awaiting tech allocation" />
        <StatCard title="Avg First Response" value={<span className="text-tertiary">38m</span>} icon="pace" iconBg="bg-tertiary-fixed" iconColor="text-on-tertiary-fixed" subtitle="12m below benchmark" />
        <StatCard title="MTTR (Avg Resolve)" value={<span className="text-primary">4.2h</span>} icon="task_alt" iconBg="bg-surface-container" iconColor="text-primary" subtitle="Target < 6.0h" />
      </div>

      {/* Table */}
      <div className="section-card">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-space-md">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-label-md font-medium whitespace-nowrap transition-all
                ${tab === t ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}>
              {t === 'ALL' ? `All (${MOCK.length})` : `${t.replace('_', ' ')} (${MOCK.filter((c) => c.status === t).length})`}
            </button>
          ))}
        </div>
        <DataTable columns={columns} data={filtered} emptyMessage="No complaints found" emptyIcon="build" />
      </div>

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`${selected?.requestNo} — ${selected?.title}`} size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setSelected(null)}>Close</button>
            {selected && TRANSITIONS[selected.status]?.length > 0 && (
              <button className="btn-primary"><Icon name="autorenew" size={16} />Update Status</button>
            )}
          </>
        }>
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Request No', value: selected.requestNo },
                { label: 'Category', value: selected.category },
                { label: 'Resident', value: selected.resident },
                { label: 'Room', value: selected.room },
                { label: 'Priority', value: <StatusBadge status={selected.priority} /> },
                { label: 'Status', value: <StatusBadge status={selected.status} /> },
                { label: 'Assigned To', value: selected.assignedTo || 'Unassigned' },
                { label: 'Raised On', value: new Date(selected.createdAt).toLocaleDateString('en-IN') },
              ].map((f) => (
                <div key={f.label}>
                  <p className="label">{f.label}</p>
                  <p className="text-body-md text-on-surface font-medium">{f.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="label">Description</p>
              <p className="text-body-md text-on-surface bg-surface-container-low p-3 rounded-lg">{selected.description}</p>
            </div>
            {TRANSITIONS[selected.status]?.length > 0 && (
              <div className="space-y-2">
                <p className="label">Assign Staff & Move Status</p>
                <div className="flex gap-2 flex-wrap">
                  <select className="input w-auto">
                    <option>Ravi Kumar</option>
                    <option>Suresh Nair</option>
                  </select>
                  {TRANSITIONS[selected.status].map((s) => (
                    <button key={s} className="btn-secondary text-sm py-1.5">
                      → {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* New complaint */}
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="Log New Complaint" size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setNewOpen(false)}>Cancel</button>
            <button className="btn-primary"><Icon name="save" size={16} />Submit</button>
          </>
        }>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Resident</label>
              <select className="input"><option>Priya Sharma</option><option>Arjun Mehta</option></select></div>
            <div><label className="label">Category</label>
              <select className="input"><option>Electrical</option><option>Plumbing</option><option>Cleaning</option><option>Wi-Fi</option><option>AC</option><option>Other</option></select></div>
            <div><label className="label">Priority</label>
              <select className="input"><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>URGENT</option></select></div>
          </div>
          <div><label className="label">Title</label><input className="input" placeholder="Brief title of the issue" /></div>
          <div><label className="label">Description</label><textarea className="input" rows={3} placeholder="Describe the issue in detail..." /></div>
        </div>
      </Modal>
    </div>
  );
};

export default Complaints;
