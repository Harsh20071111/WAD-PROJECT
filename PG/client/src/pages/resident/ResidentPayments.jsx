import { useEffect, useState } from 'react';
import StatusBadge from '../../components/StatusBadge';
import Icon from '../../components/Icon';
import { createPaymentOrder, getMyPayments, verifyPayment } from '../../services/management';

const loadRazorpay = () => new Promise((resolve) => { if (window.Razorpay) return resolve(true); const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.onload = () => resolve(true); script.onerror = () => resolve(false); document.body.appendChild(script); });

const ResidentPayments = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const load = async () => { try { setPayments(await getMyPayments()); } catch (err) { setError(err.response?.data?.message || 'Unable to load payments.'); } };
  useEffect(() => { load(); const timer = setInterval(load, 10000); return () => clearInterval(timer); }, []);
  const pay = async (payment) => { setError(''); try { const ready = await loadRazorpay(); if (!ready) throw new Error('Razorpay checkout could not load.'); const { order, key } = await createPaymentOrder(payment._id); new window.Razorpay({ key, amount: order.amount, currency: order.currency, name: 'NestOps PG', order_id: order.id, handler: async (response) => { await verifyPayment(payment._id, response); await load(); } }).open(); } catch (err) { setError(err.response?.data?.message || err.message || 'Payment could not be started.'); } };
  return <div className="flex flex-col w-full space-y-space-lg max-w-3xl"><div><h1 className="font-headline font-bold text-headline-xl text-on-surface">My Payments</h1><p className="text-body-md text-on-surface-variant">Live rent ledger powered by MongoDB and Razorpay.</p></div>{error && <div className="p-3 rounded-lg bg-error-container text-on-error-container text-body-sm">{error}</div>}<div className="section-card space-y-2">{payments.map((payment) => <div key={payment._id} className="flex items-center justify-between gap-4 p-4 rounded-xl bg-surface-container-low"><div><p className="font-semibold text-on-surface">{payment.month}</p><p className="text-label-sm text-on-surface-variant">Due {new Date(payment.dueDate).toLocaleDateString('en-IN')}</p></div><div className="flex items-center gap-4"><span className="font-semibold">₹{payment.amount.toLocaleString('en-IN')}</span><StatusBadge status={payment.status} />{payment.status !== 'PAID' && <button className="btn-primary" onClick={() => pay(payment)}><Icon name="payment" size={16} />Pay Now</button>}</div></div>)}{!payments.length && <p className="py-10 text-center text-on-surface-variant">No payment records found.</p>}</div></div>;
};

export default ResidentPayments;
