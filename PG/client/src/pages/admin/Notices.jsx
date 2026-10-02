import { useState } from 'react';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';

const MOCK_NOTICES = [
  { _id: '1', title: 'Water Supply Maintenance', body: 'Water supply will be unavailable on Sunday, 10 AM to 2 PM due to maintenance work. Please store sufficient water beforehand.', createdAt: '2026-10-01', isActive: true, createdBy: 'Admin' },
  { _id: '2', title: 'Monthly Rent Reminder', body: 'Kindly pay your monthly rent before the 5th of every month to avoid late fees. Contact admin for any payment-related queries.', createdAt: '2026-09-30', isActive: true, createdBy: 'Admin' },
];

const Notices = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: '', body: '' });

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      <div className="page-header">
        <div>
          <h1 className="font-headline font-bold text-headline-xl text-on-surface">Notice Board</h1>
          <p className="text-body-md text-on-surface-variant">Post announcements visible to all residents</p>
        </div>
        <button className="btn-primary" onClick={() => setAddOpen(true)}>
          <Icon name="add_circle" size={18} />Post Notice
        </button>
      </div>

      <div className="grid gap-space-md">
        {MOCK_NOTICES.map((n) => (
          <div key={n._id} className="section-card hover:shadow-card-hover transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                  <Icon name="campaign" size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-headline font-semibold text-headline-md text-on-surface">{n.title}</h3>
                    {n.isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-label-sm font-semibold">Active</span>
                    )}
                  </div>
                  <p className="text-body-md text-on-surface-variant">{n.body}</p>
                  <div className="flex items-center gap-3 mt-2 text-label-sm text-outline">
                    <span className="flex items-center gap-1"><Icon name="person" size={12} />{n.createdBy}</span>
                    <span className="flex items-center gap-1"><Icon name="schedule" size={12} />{new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors"><Icon name="edit" size={16} /></button>
                <button className="p-2 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors"><Icon name="delete" size={16} /></button>
              </div>
            </div>
          </div>
        ))}

        {!MOCK_NOTICES.length && (
          <div className="section-card flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <Icon name="campaign" size={48} className="opacity-30 mb-3" />
            <p className="text-body-md">No notices yet. Post one to notify residents.</p>
          </div>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Post New Notice" size="md"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="btn-primary"><Icon name="send" size={16} />Publish</button>
          </>
        }>
        <div className="space-y-4">
          <div>
            <label className="label">Notice Title</label>
            <input className="input" placeholder="e.g. Water Supply Maintenance" value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea className="input" rows={5} placeholder="Write your announcement here..."
              value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Notices;
