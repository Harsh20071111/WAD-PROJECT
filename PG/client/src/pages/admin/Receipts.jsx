import DataTable from '../../components/DataTable';
import Icon from '../../components/Icon';

const MOCK = [
  { _id: '1', receiptNo: 'RCP-001', resident: 'Priya Sharma', room: '103-C', month: 'September 2026', amount: 5500, paidAt: '2026-09-04', method: 'UPI' },
  { _id: '2', receiptNo: 'RCP-002', resident: 'Arjun Mehta', room: '203-C', month: 'September 2026', amount: 6000, paidAt: '2026-09-02', method: 'Card' },
];

const Receipts = () => {
  const columns = [
    { key: 'receiptNo', label: 'Receipt #', render: (v) => <span className="font-semibold text-primary">{v}</span> },
    {
      key: 'resident', label: 'Resident',
      render: (v, row) => (
        <div><p className="font-medium text-on-surface text-body-sm">{v}</p>
          <p className="text-label-sm text-on-surface-variant">{row.room}</p></div>
      ),
    },
    { key: 'month', label: 'Month' },
    { key: 'amount', label: 'Amount', render: (v) => <span className="tabular-nums font-semibold">₹{v.toLocaleString('en-IN')}</span> },
    { key: 'method', label: 'Method' },
    { key: 'paidAt', label: 'Date', render: (v) => new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
    {
      key: '_id', label: '',
      render: () => (
        <button className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors" title="Download">
          <Icon name="file_download" size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      <div>
        <h1 className="font-headline font-bold text-headline-xl text-on-surface">Payment Receipts</h1>
        <p className="text-body-md text-on-surface-variant">Download and manage all generated rent receipts</p>
      </div>
      <div className="section-card">
        <DataTable columns={columns} data={MOCK} emptyMessage="No receipts yet" emptyIcon="receipt_long" />
      </div>
    </div>
  );
};

export default Receipts;
