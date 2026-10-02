import { useEffect, useState } from 'react';
import StatusBadge from '../../components/StatusBadge';
import { getComplaints, getStaff, updateComplaint } from '../../services/management';

const statuses = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED'];

const Complaints = () => {
  const [items, setItems] = useState([]);
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState('');
  const load = async () => { try { const [complaints, staffMembers] = await Promise.all([getComplaints(), getStaff()]); setItems(complaints); setStaff(staffMembers); } catch (err) { setError(err.response?.data?.message || 'Unable to load requests.'); } };
  useEffect(() => { load(); const timer = setInterval(load, 10000); return () => clearInterval(timer); }, []);
  const update = async (id, payload) => { try { await updateComplaint(id, payload); await load(); } catch (err) { setError(err.response?.data?.message || 'Unable to update request.'); } };
  return <div className="flex flex-col w-full space-y-space-lg"><div><h1 className="font-headline font-bold text-headline-xl text-on-surface">Complaints & Requests</h1><p className="text-body-md text-on-surface-variant">Assign, track and resolve resident requests from MongoDB.</p></div>{error && <div className="p-3 rounded-lg bg-error-container text-on-error-container text-body-sm">{error}</div>}<div className="section-card overflow-x-auto"><table className="w-full text-body-sm"><thead><tr className="text-left text-label-sm text-on-surface-variant"><th className="p-3">Request</th><th className="p-3">Issue</th><th className="p-3">Priority</th><th className="p-3">Assign staff</th><th className="p-3">Status</th></tr></thead><tbody>{items.map((item) => <tr key={item._id} className="border-t border-outline-variant/40"><td className="p-3 font-semibold text-primary">{item.requestNo}</td><td className="p-3"><p className="font-semibold">{item.title}</p><p className="text-label-sm text-on-surface-variant">{item.category}</p></td><td className="p-3"><StatusBadge status={item.priority} showIcon={false} /></td><td className="p-3"><select className="input min-w-40" value={item.assignedStaffId?._id || item.assignedStaffId || ''} onChange={(e) => update(item._id, { assignedStaffId: e.target.value })}><option value="">Select staff</option>{staff.map((member) => <option key={member._id} value={member._id}>{member.userId?.name || 'Staff member'}</option>)}</select></td><td className="p-3"><select className="input" value={item.status} onChange={(e) => update(item._id, { status: e.target.value })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}{!items.length && <tr><td colSpan="5" className="p-10 text-center text-on-surface-variant">No requests found.</td></tr>}</tbody></table></div></div>;
};

export default Complaints;
