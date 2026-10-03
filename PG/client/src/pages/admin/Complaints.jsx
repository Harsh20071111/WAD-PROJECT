import { useState, useEffect, useCallback } from 'react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';
import Loader from '../../components/ui/Loader';
import PullToRefresh from '../../components/PullToRefresh';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';

const TRANSITIONS = {
  NEW: ['ASSIGNED'],
  ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['ON_HOLD', 'RESOLVED'],
  ON_HOLD: ['IN_PROGRESS'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
};

const Complaints = () => {
  const { subscribeToEvent } = useSocket();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [updating, setUpdating]     = useState(false);
  const [tab, setTab]               = useState('ALL');
  const [selected, setSelected]     = useState(null);
  const [newOpen, setNewOpen]       = useState(false);
  const [error, setError]           = useState('');
  const [updateNote, setUpdateNote] = useState('');
  const [staffList, setStaffList]   = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/complaints');
      if (data.success) {
        setComplaints(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin complaints:', err);
      setError('Failed to fetch complaints list from server.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  const fetchStaff = useCallback(async () => {
    try {
      const { data } = await api.get('/staff');
      if (data.success) {
        setStaffList(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch staff list:', err);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
    fetchStaff();
  }, [fetchComplaints, fetchStaff]);

  // Subscribe to real-time WebSocket events to update without page reload
  useEffect(() => {
    const unsubscribeCreated = subscribeToEvent('itemCreated', (eventData) => {
      if (eventData?.data?.type === 'complaint') {
        fetchComplaints();
      }
    });

    const unsubscribeUpdated = subscribeToEvent('itemUpdated', (eventData) => {
      if (eventData?.data?.type === 'complaint') {
        fetchComplaints();
      }
    });

    const unsubscribeData = subscribeToEvent('dataUpdated', (eventData) => {
      if (eventData?.data?.type === 'complaint') {
        fetchComplaints();
      }
    });

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeData();
    };
  }, [subscribeToEvent, fetchComplaints]);

  const handleStatusUpdate = async (newStatus) => {
    if (!selected) return;
    if (newStatus === 'ASSIGNED' && !selectedStaffId) {
      alert('Please select a staff member to assign the ticket to.');
      return;
    }
    try {
      setUpdating(true);
      const payload = {
        status: newStatus,
        note: updateNote || `Status updated to ${newStatus}`,
      };
      if (newStatus === 'ASSIGNED') {
        payload.assignedStaffId = selectedStaffId;
      }
      
      const { data } = await api.patch(`/complaints/${selected._id}/status`, payload);
      if (data.success) {
        setUpdateNote('');
        setSelectedStaffId('');
        setSelected(null);
        await fetchComplaints();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.response?.data?.message || 'Failed to update ticket status.');
    } finally {
      setUpdating(false);
    }
  };

  const getResidentName = (c) => {
    if (typeof c.residentId === 'object' && c.residentId?.userId?.name) {
      return c.residentId.userId.name;
    }
    return c.resident || 'Resident';
  };

  const getRoomNumber = (c) => {
    if (typeof c.roomId === 'object' && c.roomId?.roomNumber) {
      return `Room ${c.roomId.roomNumber}`;
    }
    return c.room || 'N/A';
  };

  const getAssignedName = (c) => {
    if (typeof c.assignedStaffId === 'object' && c.assignedStaffId?.userId?.name) {
      return c.assignedStaffId.userId.name;
    }
    return c.assignedTo || null;
  };

  const tabs = ['ALL', 'NEW', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED'];
  const filtered = tab === 'ALL' ? complaints : complaints.filter((c) => c.status === tab);

  const unassignedCount = complaints.filter((c) => !c.assignedStaffId && c.status === 'NEW').length;
  const newCount = complaints.filter((c) => c.status === 'NEW').length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

  const priorityIcon = { LOW: 'south', MEDIUM: 'remove', HIGH: 'north', URGENT: 'priority_high' };
  const priorityColor = { LOW: 'text-on-surface-variant', MEDIUM: 'text-tertiary', HIGH: 'text-secondary', URGENT: 'text-error' };

  const columns = [
    {
      key: 'requestNo', label: 'Req #',
      render: (v) => <span className="font-semibold text-primary text-label-md">{v}</span>,
    },
    {
      key: 'resident', label: 'Resident',
      render: (_, row) => (
        <div>
          <p className="font-medium text-on-surface text-body-sm">{getResidentName(row)}</p>
          <p className="text-label-sm text-on-surface-variant">{getRoomNumber(row)}</p>
        </div>
      ),
    },
    { key: 'category', label: 'Category' },
    {
      key: 'priority', label: 'Priority',
      render: (v) => (
        <span className={`flex items-center gap-1 font-semibold text-label-sm ${priorityColor[v] || 'text-on-surface-variant'}`}>
          <Icon name={priorityIcon[v] || 'remove'} size={14} />{v}
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
    { key: 'assignedStaffId', label: 'Assigned To', render: (_, row) => getAssignedName(row) || <span className="text-outline italic">Unassigned</span> },
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
    <PullToRefresh onRefresh={fetchComplaints}>
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
          <button className="btn-secondary" onClick={fetchComplaints}>
            <Icon name="refresh" size={18} />Refresh Queue
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-error-container text-on-error-container text-body-sm rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button className="text-xs font-semibold underline" onClick={fetchComplaints}>Retry</button>
        </div>
      )}

      {/* Metric strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
        <StatCard title="Total Tickets" value={complaints.length} icon="assignment" iconBg="bg-surface-container" iconColor="text-primary" subtitle="All-time requests" />
        <StatCard title="New Unassigned" value={unassignedCount} icon="assignment_late" iconBg="bg-secondary-fixed" iconColor="text-on-secondary-fixed" subtitle="Awaiting allocation" />
        <StatCard title="Pending Action" value={newCount} icon="pace" iconBg="bg-tertiary-fixed" iconColor="text-on-tertiary-fixed" subtitle="Active new queue" />
        <StatCard title="Total Resolved" value={resolvedCount} icon="task_alt" iconBg="bg-surface-container" iconColor="text-primary" subtitle="Resolved tickets" />
      </div>

      {/* Table */}
      <div className="section-card">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-space-md">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-label-md font-medium whitespace-nowrap transition-all
                ${tab === t ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}>
              {t === 'ALL' ? `All (${complaints.length})` : `${t.replace('_', ' ')} (${complaints.filter((c) => c.status === t).length})`}
            </button>
          ))}
        </div>
        {loading ? (
          <Loader text="Loading complaints queue..." />
        ) : (
          <DataTable columns={columns} data={filtered} emptyMessage="No complaints found" emptyIcon="build" />
        )}
      </div>

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => { setSelected(null); setUpdateNote(''); setSelectedStaffId(''); }} title={`${selected?.requestNo || ''} — ${selected?.title || ''}`} size="lg"
        footer={<button className="btn-secondary" onClick={() => { setSelected(null); setUpdateNote(''); setSelectedStaffId(''); }}>Close</button>}>
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
                { label: 'Assigned To', value: getAssignedName(selected) || 'Unassigned' },
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

            {/* Status Transition Action */}
            {TRANSITIONS[selected.status]?.length > 0 && (
              <div className="space-y-3 bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
                <p className="label font-semibold text-primary">Move Ticket Status</p>
                <div>
                  <input className="input text-sm mb-3" placeholder="Optional note for timeline (e.g. Technician assigned)..."
                    value={updateNote} onChange={(e) => setUpdateNote(e.target.value)} />
                  
                  {TRANSITIONS[selected.status]?.includes('ASSIGNED') && (() => {
                    const matchedStaff = staffList.filter(s => 
                      s.userId?.isActive !== false && 
                      s.categories?.some(cat => cat.toLowerCase() === selected.category?.toLowerCase())
                    );
                    return (
                      <>
                        <select 
                          className="input text-sm mb-3" 
                          value={selectedStaffId}
                          onChange={(e) => setSelectedStaffId(e.target.value)}
                        >
                          <option value="">Select Staff to Assign ({selected.category})</option>
                          {matchedStaff.map(staff => (
                            <option key={staff._id} value={staff._id}>
                              {staff.userId?.name || 'Staff Member'} — {staff.categories.join(', ')}
                            </option>
                          ))}
                        </select>
                        {matchedStaff.length === 0 && (
                          <p className="text-label-sm text-error mb-2">No staff found with "{selected.category}" specialization.</p>
                        )}
                      </>
                    );
                  })()}
                </div>
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

            {/* Activity Timeline */}
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
    </PullToRefresh>
  );
};

export default Complaints;

