import { useEffect, useState } from 'react';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';
import { getPayments, runRent, applyLateFees, recordManualPayment, updateLateFeeConfig, getMyPG, getResidents } from '../../services/management';

const Payments = () => {
  const [items, setItems] = useState([]);
  const [pgConfig, setPgConfig] = useState({ graceDays: 5, finePerDay: 50 });
  const [residents, setResidents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({ residentId: '', amount: '', mode: 'UPI', utr: '' });

  const load = async () => {
    try {
      const [paymentsData, pgData, resData] = await Promise.all([
        getPayments(),
        getMyPG(),
        getResidents()
      ]);
      setItems(paymentsData);
      if (pgData) {
        setPgConfig({ graceDays: pgData.graceDays ?? 5, finePerDay: pgData.finePerDay ?? 50 });
      }
      setResidents(resData.filter(r => r.status === 'ACTIVE'));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load payments.');
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleRunRent = async () => {
    if (!window.confirm("Run rent generation for this month?")) return;
    setActionLoading('rent');
    setActionMessage('');
    try {
      const res = await runRent();
      setActionMessage(`Rent Run Complete: Generated ${res.generated} invoices. Skipped ${res.skipped} duplicates. Total Amount: ₹${res.totalAmount}`);
      load();
    } catch (err) {
      setActionMessage(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionLoading('');
    }
  };

  const handleApplyLateFees = async () => {
    setActionLoading('late');
    setActionMessage('');
    try {
      await applyLateFees();
      setActionMessage('Late fees applied successfully to overdue invoices.');
      load();
    } catch (err) {
      setActionMessage(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionLoading('');
    }
  };

  const handleUpdateConfig = async (e) => {
    e.preventDefault();
    setActionLoading('config');
    try {
      await updateLateFeeConfig(pgConfig);
      setShowConfigModal(false);
      setActionMessage('Late fee config updated successfully.');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update config');
    } finally {
      setActionLoading('');
    }
  };

  const handleManualPayment = async (e) => {
    e.preventDefault();
    setActionLoading('manual');
    try {
      await recordManualPayment({
        ...manualForm,
        amount: Number(manualForm.amount)
      });
      setShowManualModal(false);
      setManualForm({ residentId: '', amount: '', mode: 'UPI', utr: '' });
      setActionMessage('Manual payment recorded successfully.');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setActionLoading('');
    }
  };

  const getDaysOverdue = (payment) => {
    if (payment.status === 'PAID') return 0;
    const due = new Date(payment.dueDate);
    const today = new Date();
    due.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    if (today <= due) return 0;
    const diff = Math.abs(today - due);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline font-bold text-headline-xl text-on-surface">Rent & Payments</h1>
          <p className="text-body-md text-on-surface-variant">Live payment ledger and Razorpay settlement status.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowConfigModal(true)} className="btn-secondary">
            <Icon name="settings" size={18} /> Config Late Fees
          </button>
          <button onClick={handleApplyLateFees} disabled={!!actionLoading} className="btn-secondary">
            {actionLoading === 'late' ? 'Applying...' : 'Apply Late Fees'}
          </button>
          <button onClick={() => setShowManualModal(true)} className="btn-secondary">
            <Icon name="payments" size={18} /> Record Offline
          </button>
          <button onClick={handleRunRent} disabled={!!actionLoading} className="btn-primary">
            {actionLoading === 'rent' ? 'Running...' : "Run this month's rent"}
          </button>
        </div>
      </div>

      {error && <div className="p-3 rounded-lg bg-error-container text-on-error-container text-body-sm">{error}</div>}
      {actionMessage && <div className="p-3 rounded-lg bg-primary-container text-on-primary-container text-body-sm">{actionMessage}</div>}

      <div className="section-card overflow-x-auto">
        <table className="w-full text-body-sm">
          <thead>
            <tr className="text-left text-label-sm text-on-surface-variant">
              <th className="p-3">Resident</th>
              <th className="p-3">Month</th>
              <th className="p-3">Total Amount</th>
              <th className="p-3">Paid</th>
              <th className="p-3">Due Date</th>
              <th className="p-3">Overdue Aging</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const daysOverdue = getDaysOverdue(item);
              const isOverdue = daysOverdue > 0 && item.status !== 'PAID';
              return (
                <tr key={item._id} className="border-t border-outline-variant/40">
                  <td className="p-3 font-semibold">{item.residentId?.userId?.name || 'Resident'}</td>
                  <td className="p-3">{item.month}</td>
                  <td className="p-3">₹{item.amount?.toLocaleString('en-IN')}</td>
                  <td className="p-3">₹{item.paidAmount?.toLocaleString('en-IN')}</td>
                  <td className="p-3">{new Date(item.dueDate).toLocaleDateString('en-IN')}</td>
                  <td className="p-3">
                    {isOverdue ? (
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${daysOverdue > pgConfig.graceDays ? 'bg-error text-on-error' : 'bg-orange-500/20 text-orange-600'}`}>
                        {daysOverdue} days
                      </span>
                    ) : '-'}
                  </td>
                  <td className="p-3"><StatusBadge status={item.status} /></td>
                </tr>
              );
            })}
            {!items.length && <tr><td colSpan="7" className="p-10 text-center text-on-surface-variant">No payments found.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={showConfigModal} onClose={() => setShowConfigModal(false)} title="Late Fee Configuration">
        <form onSubmit={handleUpdateConfig} className="space-y-4">
          <div>
            <label className="label">Grace Period (Days)</label>
            <input type="number" required min="0" className="input" value={pgConfig.graceDays} onChange={e => setPgConfig({...pgConfig, graceDays: Number(e.target.value)})} />
            <p className="text-xs text-on-surface-variant mt-1">Number of days after due date before fines apply.</p>
          </div>
          <div>
            <label className="label">Fine Per Day (₹)</label>
            <input type="number" required min="0" className="input" value={pgConfig.finePerDay} onChange={e => setPgConfig({...pgConfig, finePerDay: Number(e.target.value)})} />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/30">
            <button type="button" className="btn-secondary" onClick={() => setShowConfigModal(false)}>Cancel</button>
            <button type="submit" disabled={actionLoading === 'config'} className="btn-primary">Save Config</button>
          </div>
        </form>
      </Modal>

      <Modal open={showManualModal} onClose={() => setShowManualModal(false)} title="Record Offline Payment">
        <form onSubmit={handleManualPayment} className="space-y-4">
          <div>
            <label className="label">Resident</label>
            <select required className="input" value={manualForm.residentId} onChange={e => setManualForm({...manualForm, residentId: e.target.value})}>
              <option value="">Select a resident...</option>
              {residents.map(r => (
                <option key={r._id} value={r._id}>{r.userId?.name} (Room {r.roomId?.roomNumber})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Amount Paid (₹)</label>
            <input type="number" required min="1" className="input" value={manualForm.amount} onChange={e => setManualForm({...manualForm, amount: e.target.value})} />
          </div>
          <div>
            <label className="label">Payment Mode</label>
            <select className="input" value={manualForm.mode} onChange={e => setManualForm({...manualForm, mode: e.target.value})}>
              <option value="UPI">UPI</option>
              <option value="CASH">Cash</option>
              <option value="BANK">Bank Transfer</option>
            </select>
          </div>
          {manualForm.mode === 'UPI' && (
            <div>
              <label className="label">UTR / Reference Number *</label>
              <input type="text" required className="input" value={manualForm.utr} onChange={e => setManualForm({...manualForm, utr: e.target.value})} />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/30">
            <button type="button" className="btn-secondary" onClick={() => setShowManualModal(false)}>Cancel</button>
            <button type="submit" disabled={actionLoading === 'manual'} className="btn-primary">Record Payment</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Payments;
