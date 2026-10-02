import { useState } from 'react';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';

const MOCK = [
  { _id: '1', requestNo: 'REQ1001', category: 'Electrical', priority: 'HIGH', title: 'Fan not working', description: 'Ceiling fan stopped working since yesterday evening.', status: 'ASSIGNED', assignedTo: 'Ravi Kumar', createdAt: '2026-10-01',
    timeline: [
      { status: 'NEW', note: 'Request submitted', time: '2026-10-01T10:00:00' },
      { status: 'ASSIGNED', note: 'Assigned to Ravi Kumar', time: '2026-10-01T11:30:00' },
    ],
  },
];

const ResidentComplaints = () => {
  const [newOpen, setNewOpen]   = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState({ category: 'Electrical', priority: 'MEDIUM', title: '', description: '' });

  const statusColor = { NEW: 'text-tertiary', ASSIGNED: 'text-secondary', IN_PROGRESS: 'text-secondary', RESOLVED: 'text-primary', CLOSED: 'text-outline' };

  return (
    <div className="flex flex-col w-full space-y-space-lg max-w-3xl">
      <div className="page-header">
        <div>
          <h1 className="font-headline font-bold text-headline-xl text-on-surface">Service Requests</h1>
          <p className="text-body-md text-on-surface-variant">Submit and track your maintenance complaints</p>
        </div>
        <button className="btn-primary" onClick={() => setNewOpen(true)}>
          <Icon name="add_circle" size={18} />New Request
        </button>
      </div>

      <div className="space-y-3">
        {MOCK.map((c) => (
          <div key={c._id} className="section-card hover:shadow-card-hover transition-shadow cursor-pointer" onClick={() => setSelected(c)}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
                  <Icon name="build" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-primary text-label-md">{c.requestNo}</span>
                    <StatusBadge status={c.priority} showIcon={false} />
                  </div>
                  <p className="font-semibold text-on-surface text-body-md">{c.title}</p>
                  <p className="text-label-sm text-on-surface-variant">{c.category} · Raised {new Date(c.createdAt).toLocaleDateString('en-IN')}</p>
                  {c.assignedTo && (
                    <p className="text-label-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <Icon name="engineering" size={12} />Assigned to {c.assignedTo}
                    </p>
                  )}
                </div>
              </div>
              <StatusBadge status={c.status} />
            </div>
          </div>
        ))}

        {!MOCK.length && (
          <div className="section-card flex flex-col items-center py-16 text-on-surface-variant gap-3">
            <Icon name="build" size={48} className="opacity-30" />
            <p className="text-body-md">No requests yet. Everything working well? 🎉</p>
            <button className="btn-primary mt-2" onClick={() => setNewOpen(true)}><Icon name="add" size={16} />New Request</button>
          </div>
        )}
      </div>

      {/* Detail + Timeline */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`${selected?.requestNo} — ${selected?.title}`} size="lg"
        footer={<button className="btn-secondary" onClick={() => setSelected(null)}>Close</button>}>
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="label">Category</p><p className="text-body-md font-medium">{selected.category}</p></div>
              <div><p className="label">Priority</p><StatusBadge status={selected.priority} /></div>
              <div><p className="label">Status</p><StatusBadge status={selected.status} /></div>
              <div><p className="label">Assigned To</p><p className="text-body-md">{selected.assignedTo || '—'}</p></div>
            </div>
            <div>
              <p className="label">Description</p>
              <p className="text-body-md bg-surface-container-low p-3 rounded-lg">{selected.description}</p>
            </div>
            {/* Timeline */}
            <div>
              <p className="label mb-3">Activity Timeline</p>
              <div className="relative pl-6 space-y-4">
                {selected.timeline.map((t, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                    {i < selected.timeline.length - 1 && (
                      <div className="absolute -left-[21px] top-4 w-0.5 h-full bg-outline-variant" />
                    )}
                    <div className="bg-surface-container-low rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <StatusBadge status={t.status} />
                        <span className="text-label-sm text-outline">
                          {new Date(t.time).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-body-sm text-on-surface">{t.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* New Complaint */}
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="New Service Request" size="lg"
        footer={<><button className="btn-secondary" onClick={() => setNewOpen(false)}>Cancel</button><button className="btn-primary"><Icon name="send" size={16} />Submit</button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                {['Electrical', 'Plumbing', 'Cleaning', 'Furniture', 'Wi-Fi', 'AC', 'Water', 'Security', 'Other'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
                <option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>URGENT</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Title</label>
            <input className="input" placeholder="Brief title of the issue"
              value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={4} placeholder="Please describe the issue in detail..."
              value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ResidentComplaints;
