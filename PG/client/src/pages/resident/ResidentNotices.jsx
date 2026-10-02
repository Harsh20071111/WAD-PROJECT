import Icon from '../../components/Icon';

const MOCK = [
  { _id: '1', title: 'Water Supply Maintenance', body: 'Water supply will be unavailable on Sunday, 10 AM to 2 PM due to maintenance work. Please store sufficient water beforehand.', createdAt: '2026-10-01' },
  { _id: '2', title: 'Monthly Rent Reminder', body: 'Kindly pay your monthly rent before the 5th of every month to avoid late fees. Contact admin for any payment-related queries.', createdAt: '2026-09-30' },
];

const ResidentNotices = () => (
  <div className="flex flex-col w-full space-y-space-lg max-w-3xl">
    <div>
      <h1 className="font-headline font-bold text-headline-xl text-on-surface">Notices</h1>
      <p className="text-body-md text-on-surface-variant">Announcements and updates from management</p>
    </div>

    <div className="space-y-3">
      {MOCK.map((n) => (
        <div key={n._id} className="section-card hover:shadow-card-hover transition-shadow">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0">
              <Icon name="campaign" size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-headline font-semibold text-headline-md text-on-surface mb-1">{n.title}</h3>
              <p className="text-body-md text-on-surface-variant">{n.body}</p>
              <p className="text-label-sm text-outline mt-2 flex items-center gap-1">
                <Icon name="schedule" size={12} />
                {new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      ))}
      {!MOCK.length && (
        <div className="section-card flex flex-col items-center py-16 text-on-surface-variant gap-3">
          <Icon name="campaign" size={48} className="opacity-30" />
          <p className="text-body-md">No notices at the moment.</p>
        </div>
      )}
    </div>
  </div>
);

export default ResidentNotices;
