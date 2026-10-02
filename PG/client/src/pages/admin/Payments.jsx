import { useEffect, useState } from 'react';
import StatusBadge from '../../components/StatusBadge';
import { getPayments } from '../../services/management';

const Payments = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const load = async () => { try { setItems(await getPayments()); } catch (err) { setError(err.response?.data?.message || 'Unable to load payments.'); } };
  useEffect(() => { load(); const timer = setInterval(load, 10000); return () => clearInterval(timer); }, []);
  return <div className="flex flex-col w-full space-y-space-lg"><div><h1 className="font-headline font-bold text-headline-xl text-on-surface">Rent & Payments</h1><p className="text-body-md text-on-surface-variant">Live payment ledger and Razorpay settlement status.</p></div>{error && <div className="p-3 rounded-lg bg-error-container text-on-error-container text-body-sm">{error}</div>}<div className="section-card overflow-x-auto"><table className="w-full text-body-sm"><thead><tr className="text-left text-label-sm text-on-surface-variant"><th className="p-3">Resident</th><th className="p-3">Month</th><th className="p-3">Amount</th><th className="p-3">Due</th><th className="p-3">Status</th></tr></thead><tbody>{items.map((item) => <tr key={item._id} className="border-t border-outline-variant/40"><td className="p-3 font-semibold">{item.residentId?.userId?.name || 'Resident'}</td><td className="p-3">{item.month}</td><td className="p-3">₹{item.amount?.toLocaleString('en-IN')}</td><td className="p-3">{new Date(item.dueDate).toLocaleDateString('en-IN')}</td><td className="p-3"><StatusBadge status={item.status} /></td></tr>)}{!items.length && <tr><td colSpan="5" className="p-10 text-center text-on-surface-variant">No payments found.</td></tr>}</tbody></table></div></div>;
};

export default Payments;
