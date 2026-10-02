import { useState } from 'react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';

const MOCK_PAYMENTS = [
  { _id: '1', resident: 'Priya Sharma', room: '103-C', month: '2026-10', amount: 5500, paidAmount: 5500, dueDate: '2026-10-05', status: 'PAID', method: 'UPI', paidAt: '2026-10-03' },
  { _id: '2', resident: 'Arjun Mehta', room: '203-C', month: '2026-10', amount: 6000, paidAmount: 0, dueDate: '2026-10-05', status: 'PENDING', method: '', paidAt: '' },
  { _id: '3', resident: 'Priya Sharma', room: '103-C', month: '2026-09', amount: 5500, paidAmount: 5500, dueDate: '2026-09-05', status: 'PAID', method: 'Card', paidAt: '2026-09-04' },
  { _id: '4', resident: 'Arjun Mehta', room: '203-C', month: '2026-09', amount: 6000, paidAmount: 6000, dueDate: '2026-09-05', status: 'PAID', method: 'UPI', paidAt: '2026-09-02' },
  { _id: '5', resident: 'Sneha Patel', room: '—', month: '2026-10', amount: 7000, paidAmount: 0, dueDate: '2026-10-05', status: 'OVERDUE', method: '', paidAt: '' },
];

const fmtINR = (v) => `₹${Number(v).toLocaleString('en-IN')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtMonth = (m) => m ? new Date(m + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—';

const Payments = () => {
  const [tab, setTab] = useState('ALL');
  const [manualOpen, setManualOpen] = useState(false);

  const tabs = ['ALL', 'PAID', 'PENDING', 'OVERDUE'];
  const filtered = tab === 'ALL' ? MOCK_PAYMENTS : MOCK_PAYMENTS.filter((p) => p.status === tab);

  const totalCollected = MOCK_PAYMENTS.filter((p) => p.status === 'PAID').reduce((s, p) => s + p.paidAmount, 0);
  const totalOverdue = MOCK_PAYMENTS.filter((p) => p.status === 'OVERDUE').reduce((s, p) => s + p.amount, 0);
  const totalPending = MOCK_PAYMENTS.filter((p) => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0);

  const columns = [
    {
      key: 'resident', label: 'Resident',
      render: (v, row) => (
        <div>
          <p className="font-semibold text-on-surface">{v}</p>
          <p className="text-label-sm text-on-surface-variant">{row.room}</p>
        </div>
      ),
    },
    { key: 'month', label: 'Month', render: (v) => fmtMonth(v) },
    { key: 'amount', label: 'Rent Due', render: (v) => <span className="tabular-nums font-semibold">{fmtINR(v)}</span> },
    { key: 'paidAmount', label: 'Paid', render: (v) => <span className="tabular-nums">{fmtINR(v)}</span> },
    { key: 'dueDate', label: 'Due Date', render: (v) => fmtDate(v) },
    { key: 'method', label: 'Method', render: (v) => v || '—' },
    { key: 'paidAt', label: 'Paid On', render: (v) => fmtDate(v) },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    {
      key: '_id', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          {row.status === 'PAID' && (
            <button className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors" title="Receipt">
              <Icon name="receipt_long" size={16} />
            </button>
          )}
          {(row.status === 'PENDING' || row.status === 'OVERDUE') && (
            <button className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-secondary transition-colors" title="Mark Paid">
              <Icon name="add_card" size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-label-sm text-outline uppercase tracking-wider">Finance & Accounts</span>
            <span className="text-outline-variant">/</span>
            <span className="text-label-sm text-primary font-semibold uppercase tracking-wider">Ledger & Settlements</span>
          </div>
          <h1 className="font-headline font-bold text-headline-xl text-on-surface">Rent & Payment Ledger</h1>
          <p className="text-body-md text-on-surface-variant mt-0.5">Automated billing, reconciliations, receipts & overdue recovery</p>
        </div>
        <div className="flex items-center gap-space-sm">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container text-on-surface-variant">
            <Icon name="schedule" size={18} className="text-primary" />
            <span className="text-label-md text-on-surface">Next auto-run in 12 days</span>
          </div>
          <button className="btn-primary" onClick={() => setManualOpen(true)}>
            <Icon name="add_card" size={18} />
            Record Manual Payment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        <StatCard title="Oct 2026 Collection" value="₹6,48,000" icon="account_balance_wallet" iconBg="bg-primary-fixed" iconColor="text-on-primary-fixed">
          <div className="mt-3 bg-surface-container-low p-2 rounded-lg">
            <div className="flex items-center justify-between text-label-sm mb-1">
              <span className="text-on-surface-variant">Collection Target</span>
              <span className="text-primary font-bold">79% achieved</span>
            </div>
            <div className="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '79%' }} />
            </div>
          </div>
        </StatCard>

        <StatCard title="Total Overdue" value={<span className="text-error">₹42,500</span>} icon="warning" iconBg="bg-error-container" iconColor="text-on-error-container">
          <div className="mt-3 flex items-center justify-between bg-error-container/30 p-2 rounded-lg text-body-sm">
            <span className="text-on-surface-variant flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-error" />1 resident overdue
            </span>
            <button className="text-label-sm text-error font-semibold hover:underline flex items-center gap-0.5">
              Send SMS <Icon name="arrow_forward" size={13} />
            </button>
          </div>
        </StatCard>

        <StatCard title="Security Deposits" value="₹16,80,000" icon="lock" iconBg="bg-secondary-fixed" iconColor="text-on-secondary-fixed" subtitle="Protected PG corpus" />

        <StatCard title="Gateway Payouts" value="₹5,80,000" icon="account_balance" iconBg="bg-surface-container" iconColor="text-tertiary" subtitle="Settled · HDFC A/c ••4912" />
      </div>

      {/* Table */}
      <div className="section-card">
        {/* Tabs */}
        <div className="flex gap-1 mb-space-md overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-label-md font-medium whitespace-nowrap transition-all
                ${tab === t ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}
            >
              {t === 'ALL' ? `All Payments (${MOCK_PAYMENTS.length})` : `${t.replace('_', ' ')} (${MOCK_PAYMENTS.filter((p) => p.status === t).length})`}
            </button>
          ))}
        </div>

        <DataTable columns={columns} data={filtered} emptyMessage="No payments found" emptyIcon="receipt_long" />
      </div>

      {/* Manual payment modal */}
      <Modal
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        title="Record Manual Payment"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setManualOpen(false)}>Cancel</button>
            <button className="btn-primary"><Icon name="save" size={16} />Record Payment</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Resident</label>
            <select className="input">
              <option>Priya Sharma — Room 103-C</option>
              <option>Arjun Mehta — Room 203-C</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Month</label><input className="input" type="month" defaultValue="2026-10" /></div>
            <div><label className="label">Amount (₹)</label><input className="input" type="number" placeholder="5500" /></div>
            <div><label className="label">Payment Method</label>
              <select className="input"><option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option></select>
            </div>
            <div><label className="label">Date Paid</label><input className="input" type="date" /></div>
          </div>
          <div><label className="label">Transaction Reference</label><input className="input" placeholder="UTR / reference number" /></div>
          <div><label className="label">Notes</label><textarea className="input" rows={2} placeholder="Optional notes" /></div>
        </div>
      </Modal>
    </div>
  );
};

export default Payments;
