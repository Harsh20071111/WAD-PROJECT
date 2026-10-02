import StatusBadge from '../../components/StatusBadge';
import Icon from '../../components/Icon';

const MOCK = [
  { month: 'October 2026', amount: 5500, paidAmount: 0, dueDate: '2026-10-05', status: 'PENDING' },
  { month: 'September 2026', amount: 5500, paidAmount: 5500, dueDate: '2026-09-05', status: 'PAID', paidAt: '2026-09-04', method: 'UPI', receipt: 'RCP-001' },
];

const ResidentPayments = () => (
  <div className="flex flex-col w-full space-y-space-lg max-w-3xl">
    <div>
      <h1 className="font-headline font-bold text-headline-xl text-on-surface">My Payments</h1>
      <p className="text-body-md text-on-surface-variant">Monthly rent history and payment status</p>
    </div>

    {/* Current month highlight */}
    {MOCK[0].status === 'PENDING' && (
      <div className="section-card border-2 border-secondary/30 bg-secondary-fixed/10">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-label-sm text-secondary font-semibold uppercase tracking-wider mb-1">Payment Due</p>
            <h2 className="font-headline font-bold text-headline-lg text-on-surface">{MOCK[0].month}</h2>
            <p className="text-body-md text-on-surface-variant mt-1">Due by {new Date(MOCK[0].dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-label-sm text-on-surface-variant">Amount</p>
              <p className="font-headline font-bold text-headline-lg text-on-surface tabular-nums">₹{MOCK[0].amount.toLocaleString('en-IN')}</p>
            </div>
            <button className="btn-primary px-6 py-3">
              <Icon name="payment" size={20} />Pay Now
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Payment history */}
    <div className="section-card">
      <h2 className="font-headline font-semibold text-headline-md text-on-surface mb-space-md flex items-center gap-2">
        <Icon name="history" size={20} className="text-primary" />Payment History
      </h2>
      <div className="space-y-2">
        {MOCK.map((p) => (
          <div key={p.month} className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                ${p.status === 'PAID' ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-secondary-fixed text-on-secondary-fixed'}`}>
                <Icon name={p.status === 'PAID' ? 'check_circle' : 'schedule'} size={20} />
              </div>
              <div>
                <p className="font-semibold text-on-surface text-body-md">{p.month}</p>
                <p className="text-label-sm text-on-surface-variant">
                  {p.status === 'PAID'
                    ? `Paid via ${p.method} on ${new Date(p.paidAt).toLocaleDateString('en-IN')}`
                    : `Due: ${new Date(p.dueDate).toLocaleDateString('en-IN')}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold tabular-nums text-on-surface">₹{p.amount.toLocaleString('en-IN')}</span>
              <StatusBadge status={p.status} />
              {p.status === 'PAID' && (
                <button className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors" title="Download Receipt">
                  <Icon name="file_download" size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ResidentPayments;
