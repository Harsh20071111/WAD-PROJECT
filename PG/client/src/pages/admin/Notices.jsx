import { useState, useEffect, useCallback } from 'react';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';
import Loader from '../../components/ui/Loader';
import { getNotices, createNotice, deleteNotice } from '../../services/management';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const Notices = () => {
  const { user } = useAuth();
  const { subscribeToEvent } = useSocket();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', audience: { type: 'ALL' }, isUrgent: false, isPinned: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotices();
      setNotices(data);
    } catch (err) {
      console.error('Error fetching notices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  useEffect(() => {
    const unsubCreated = subscribeToEvent('itemCreated', (e) => {
      if (e?.type === 'notice') fetchNotices();
    });
    const unsubUpdated = subscribeToEvent('itemUpdated', (e) => {
      if (e?.type === 'notice') fetchNotices();
    });
    const unsubDeleted = subscribeToEvent('itemDeleted', (e) => {
      if (e?.type === 'notice') fetchNotices();
    });
    const unsubData = subscribeToEvent('dataUpdated', (e) => {
      if (e?.type === 'notice') fetchNotices();
    });

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
      unsubData();
    };
  }, [subscribeToEvent, fetchNotices]);

  const handlePublish = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      setError('Title and Message are required.');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      await createNotice(form);
      setAddOpen(false);
      setForm({ title: '', body: '', audience: { type: 'ALL' }, isUrgent: false, isPinned: false });
      fetchNotices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish notice.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    
    try {
      await deleteNotice(id);
      fetchNotices();
    } catch (err) {
      console.error('Failed to delete notice:', err);
      alert('Failed to delete notice.');
    }
  };

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
        {loading ? (
          <Loader text="Loading notices..." />
        ) : notices.length > 0 ? (
          notices.map((n) => (
            <div key={n._id} className="section-card hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.isUrgent ? 'bg-error-container text-on-error-container' : 'bg-primary-fixed text-primary'}`}>
                    <Icon name={n.isUrgent ? 'priority_high' : 'campaign'} size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-headline font-semibold text-headline-md text-on-surface">{n.title}</h3>
                      {n.isActive && (
                        <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-label-sm font-semibold">Active</span>
                      )}
                      {n.isPinned && (
                        <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-label-sm font-semibold flex items-center gap-1"><Icon name="push_pin" size={12}/>Pinned</span>
                      )}
                    </div>
                    <p className="text-body-md text-on-surface-variant">{n.body}</p>
                    <div className="flex items-center gap-3 mt-2 text-label-sm text-outline">
                      <span className="flex items-center gap-1"><Icon name="person" size={12} />Admin</span>
                      <span className="flex items-center gap-1"><Icon name="schedule" size={12} />{new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><Icon name="visibility" size={12} />Visible to: {n.audience?.type === 'ALL' ? 'Everyone' : n.audience?.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleDelete(n._id)} className="p-2 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors"><Icon name="delete" size={16} /></button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="section-card flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <Icon name="campaign" size={48} className="opacity-30 mb-3" />
            <p className="text-body-md">No notices yet. Post one to notify residents.</p>
          </div>
        )}
      </div>

      <Modal open={addOpen} onClose={() => { setAddOpen(false); setError(''); }} title="Post New Notice" size="md"
        footer={
          <>
            <button className="btn-secondary" onClick={() => { setAddOpen(false); setError(''); }}>Cancel</button>
            <button className="btn-primary" onClick={handlePublish} disabled={submitting}>
              <Icon name="send" size={16} />{submitting ? 'Publishing...' : 'Publish'}
            </button>
          </>
        }>
        <div className="space-y-4">
          {error && <div className="p-3 bg-error-container text-on-error-container rounded-lg text-body-sm">{error}</div>}
          <div>
            <label className="label">Notice Title</label>
            <input className="input w-full" placeholder="e.g. Water Supply Maintenance" value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea className="input w-full" rows={5} placeholder="Write your announcement here..."
              value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="label">Audience</label>
                <select className="input w-full" value={form.audience.type} onChange={(e) => setForm((p) => ({ ...p, audience: { type: e.target.value } }))}>
                  <option value="ALL">Everyone</option>
                  <option value="RESIDENTS">Residents Only</option>
                  <option value="STAFF">Staff Only</option>
                </select>
             </div>
             <div className="flex flex-col gap-2 pt-6">
                <label className="flex items-center gap-2 text-label-md cursor-pointer text-on-surface">
                  <input type="checkbox" checked={form.isUrgent} onChange={(e) => setForm(p => ({ ...p, isUrgent: e.target.checked }))} className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
                  Mark as Urgent
                </label>
                <label className="flex items-center gap-2 text-label-md cursor-pointer text-on-surface">
                  <input type="checkbox" checked={form.isPinned} onChange={(e) => setForm(p => ({ ...p, isPinned: e.target.checked }))} className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
                  Pin to Top
                </label>
             </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Notices;
