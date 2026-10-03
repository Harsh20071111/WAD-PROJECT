import { useState, useEffect, useCallback } from 'react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import Icon from '../../components/Icon';
import Loader from '../../components/ui/Loader';
import api from '../../services/api';

const ResidentComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newOpen, setNewOpen]       = useState(false);
  const [selected, setSelected]     = useState(null);
  const [error, setError]           = useState('');
  const [form, setForm]             = useState({
    category: 'Electrical',
    priority: 'MEDIUM',
    title: '',
    description: '',
  });

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/complaints');
      if (data.success) {
        setComplaints(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
      setError('Unable to load service requests. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('Please fill in both title and description.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const { data } = await api.post('/complaints', form);
      if (data.success) {
        setForm({ category: 'Electrical', priority: 'MEDIUM', title: '', description: '' });
        setNewOpen(false);
        await fetchComplaints();
      }
    } catch (err) {
      console.error('Failed to submit complaint:', err);
      setError(err.response?.data?.message || 'Failed to submit service request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getAssignedName = (c) => {
    if (!c) return null;
    if (typeof c.assignedStaffId === 'object' && c.assignedStaffId?.userId?.name) {
      return c.assignedStaffId.userId.name;
    }
    return c.assignedTo || null;
  };

  return (
    <div className="flex flex-col w-full space-y-space-lg max-w-3xl">
      <div className="page-header">
        <div>
          <h1 className="font-headline font-bold text-headline-xl text-on-surface">Service Requests</h1>
          <p className="text-body-md text-on-surface-variant">Submit and track your maintenance complaints</p>
        </div>
        <button className="btn-primary" onClick={() => { setError(''); setNewOpen(true); }}>
          <Icon name="add_circle" size={18} />New Request
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-error-container text-on-error-container text-body-sm rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button className="text-xs font-semibold underline" onClick={fetchComplaints}>Retry</button>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <Loader text="Loading service requests..." className="section-card py-12" />
        ) : (
          complaints.map((c) => {
            const assignedName = getAssignedName(c);
            return (
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
                      {assignedName && (
                        <p className="text-label-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <Icon name="engineering" size={12} />Assigned to {assignedName}
                        </p>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              </div>
            );
          })
        )}

        {!loading && !complaints.length && (
          <div className="section-card flex flex-col items-center py-16 text-on-surface-variant gap-3">
            <Icon name="build" size={48} className="opacity-30" />
            <p className="text-body-md">No requests yet. Everything working well? 🎉</p>
            <button className="btn-primary mt-2" onClick={() => { setError(''); setNewOpen(true); }}>
              <Icon name="add" size={16} />New Request
            </button>
          </div>
        )}
      </div>

      {/* Detail + Timeline */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`${selected?.requestNo || ''} — ${selected?.title || ''}`} size="lg"
        footer={<button className="btn-secondary" onClick={() => setSelected(null)}>Close</button>}>
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="label">Category</p><p className="text-body-md font-medium">{selected.category}</p></div>
              <div><p className="label">Priority</p><StatusBadge status={selected.priority} /></div>
              <div><p className="label">Status</p><StatusBadge status={selected.status} /></div>
              <div><p className="label">Assigned To</p><p className="text-body-md">{getAssignedName(selected) || 'Unassigned'}</p></div>
            </div>
            <div>
              <p className="label">Description</p>
              <p className="text-body-md bg-surface-container-low p-3 rounded-lg">{selected.description}</p>
            </div>
            {/* Timeline */}
            {selected.timeline && selected.timeline.length > 0 && (
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
            )}
          </div>
        )}
      </Modal>

      {/* New Complaint Modal */}
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="New Service Request" size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setNewOpen(false)} disabled={submitting}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Icon name="progress_activity" size={16} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Icon name="send" size={16} />
                  Submit Request
                </>
              )}
            </button>
          </>
        }>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <input className="input" placeholder="Brief title of the issue" required
              value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={4} placeholder="Please describe the issue in detail..." required
              value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default ResidentComplaints;

