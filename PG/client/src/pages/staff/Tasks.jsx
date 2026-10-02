import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';
import api from '../../services/api';

const TRANSITIONS = {
  ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['ON_HOLD', 'RESOLVED'],
  ON_HOLD: ['IN_PROGRESS'],
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateNote, setUpdateNote] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/complaints');
      if (data.success) {
        setTasks(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleStatusUpdate = async (newStatus) => {
    if (!selected) return;
    try {
      setUpdating(true);
      const { data } = await api.patch(`/complaints/${selected._id}/status`, {
        status: newStatus,
        note: updateNote || `Status updated to ${newStatus}`,
      });
      if (data.success) {
        setUpdateNote('');
        setSelected(null);
        await fetchTasks();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const getResidentName = (c) => {
    if (typeof c.residentId === 'object' && c.residentId?.userId?.name) {
      return c.residentId.userId.name;
    }
    return 'Resident';
  };

  const getRoomNumber = (c) => {
    if (typeof c.roomId === 'object' && c.roomId?.roomNumber) {
      return `Room ${c.roomId.roomNumber}`;
    }
    return 'N/A';
  };

  const priorityIcon = { LOW: 'south', MEDIUM: 'remove', HIGH: 'north', URGENT: 'priority_high' };
  const priorityColor = { LOW: 'text-on-surface-variant', MEDIUM: 'text-tertiary', HIGH: 'text-secondary', URGENT: 'text-error' };

  const activeTasks = tasks.filter(t => ['ASSIGNED', 'IN_PROGRESS', 'ON_HOLD'].includes(t.status));
  const resolvedTasks = tasks.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Staff workspace"
        title="My tasks"
        description={`${activeTasks.length} active · ${resolvedTasks.length} resolved`}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Assigned', count: tasks.filter(t => t.status === 'ASSIGNED').length, icon: 'assignment_ind', bg: 'bg-sky-100', color: 'text-sky-700' },
          { label: 'In Progress', count: tasks.filter(t => t.status === 'IN_PROGRESS').length, icon: 'engineering', bg: 'bg-amber-100', color: 'text-amber-700' },
          { label: 'On Hold', count: tasks.filter(t => t.status === 'ON_HOLD').length, icon: 'pause_circle', bg: 'bg-rose-100', color: 'text-rose-700' },
          { label: 'Resolved', count: resolvedTasks.length, icon: 'task_alt', bg: 'bg-emerald-100', color: 'text-emerald-700' },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">{s.label}</span>
              <span className={`${s.bg} ${s.color} p-1.5 rounded-lg`}><Icon name={s.icon} size={18} /></span>
            </div>
            <span className="font-headline font-bold text-2xl text-on-surface">{s.count}</span>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-on-surface-variant gap-3">
          <Icon name="progress_activity" size={24} className="animate-spin text-primary" />
          <p className="text-body-md">Loading your tasks...</p>
        </div>
      ) : activeTasks.length === 0 && resolvedTasks.length === 0 ? (
        <EmptyState icon="assignment" title="No tasks yet" description="Your assigned maintenance work will be listed here." />
      ) : (
        <div className="space-y-6">
          {/* Active Tasks */}
          {activeTasks.length > 0 && (
            <Card className="p-5">
              <h2 className="font-headline text-headline-md font-semibold mb-4">Active Tasks</h2>
              <div className="divide-y divide-slate-200">
                {activeTasks.map(task => (
                  <div key={task._id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 cursor-pointer hover:bg-surface-container-low rounded-lg px-2 -mx-2 transition-colors" onClick={() => setSelected(task)}>
                    <div className={`shrink-0 p-2 rounded-lg ${priorityColor[task.priority] || 'text-on-surface-variant'}`}>
                      <Icon name={priorityIcon[task.priority] || 'remove'} size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-body-sm text-on-surface">{task.requestNo} — {task.title}</p>
                      <p className="text-label-sm text-on-surface-variant">{getResidentName(task)} · {getRoomNumber(task)} · {task.category}</p>
                    </div>
                    <StatusBadge status={task.status} />
                    <Icon name="chevron_right" size={20} className="text-outline shrink-0" />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Resolved Tasks */}
          {resolvedTasks.length > 0 && (
            <Card className="p-5">
              <h2 className="font-headline text-headline-md font-semibold mb-4 text-on-surface-variant">Completed</h2>
              <div className="divide-y divide-slate-200">
                {resolvedTasks.map(task => (
                  <div key={task._id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 cursor-pointer hover:bg-surface-container-low rounded-lg px-2 -mx-2 transition-colors opacity-70" onClick={() => setSelected(task)}>
                    <div className="shrink-0 p-2 rounded-lg text-emerald-600">
                      <Icon name="task_alt" size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-body-sm text-on-surface">{task.requestNo} — {task.title}</p>
                      <p className="text-label-sm text-on-surface-variant">{getResidentName(task)} · {task.category}</p>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Task Detail Modal */}
      <Modal open={!!selected} onClose={() => { setSelected(null); setUpdateNote(''); }} title={`${selected?.requestNo || ''} — ${selected?.title || ''}`} size="lg"
        footer={<button className="btn-secondary" onClick={() => { setSelected(null); setUpdateNote(''); }}>Close</button>}>
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Request No', value: selected.requestNo },
                { label: 'Category', value: selected.category },
                { label: 'Resident', value: getResidentName(selected) },
                { label: 'Room', value: getRoomNumber(selected) },
                { label: 'Priority', value: <StatusBadge status={selected.priority} /> },
                { label: 'Status', value: <StatusBadge status={selected.status} /> },
                { label: 'SLA Due', value: selected.slaDueAt ? new Date(selected.slaDueAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A' },
                { label: 'Raised On', value: new Date(selected.createdAt).toLocaleDateString('en-IN') },
              ].map((f) => (
                <div key={f.label}>
                  <p className="label">{f.label}</p>
                  <div className="text-body-md text-on-surface font-medium">{f.value}</div>
                </div>
              ))}
            </div>
            <div>
              <p className="label">Description</p>
              <p className="text-body-md text-on-surface bg-surface-container-low p-3 rounded-lg">{selected.description}</p>
            </div>

            {/* Status Transition */}
            {TRANSITIONS[selected.status]?.length > 0 && (
              <div className="space-y-3 bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
                <p className="label font-semibold text-primary">Update Task Status</p>
                <input className="input text-sm" placeholder="Add a note (e.g. Parts ordered, waiting for delivery)..."
                  value={updateNote} onChange={(e) => setUpdateNote(e.target.value)} />
                <div className="flex gap-2 flex-wrap">
                  {TRANSITIONS[selected.status].map((nextState) => (
                    <button key={nextState} disabled={updating} onClick={() => handleStatusUpdate(nextState)}
                      className="btn-primary text-sm py-1.5 flex items-center gap-1.5">
                      {updating ? <Icon name="progress_activity" size={14} className="animate-spin" /> : <Icon name="arrow_forward" size={14} />}
                      Mark as {nextState.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {selected.timeline && selected.timeline.length > 0 && (
              <div>
                <p className="label mb-3">Activity Timeline</p>
                <div className="relative pl-6 space-y-3">
                  {selected.timeline.map((t, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                      {i < selected.timeline.length - 1 && (
                        <div className="absolute -left-[21px] top-4 w-0.5 h-full bg-outline-variant" />
                      )}
                      <div className="bg-surface-container-low rounded-lg p-2.5">
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
    </div>
  );
};

export default Tasks;
