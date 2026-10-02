import StatusBadge from '../../components/StatusBadge';
import Icon from '../../components/Icon';

const MOCK = {
  roomNumber: '103', floor: 1, type: 'TRIPLE', bedLabel: 'C',
  rent: 5500, amenities: ['Wi-Fi', 'Attached Bathroom', 'Fan'],
  beds: [
    { label: 'A', status: 'OCCUPIED', resident: 'Anita Rao' },
    { label: 'B', status: 'OCCUPIED', resident: 'Divya Joshi' },
    { label: 'C', status: 'OCCUPIED', resident: 'Priya Sharma (You)', isMe: true },
  ],
  joiningDate: '2025-01-01',
  monthlyRent: 5500,
  securityDeposit: 11000,
};

const MyRoom = () => (
  <div className="flex flex-col w-full space-y-space-lg max-w-3xl">
    <div>
      <h1 className="font-headline font-bold text-headline-xl text-on-surface">My Room</h1>
      <p className="text-body-md text-on-surface-variant">Room details, bed assignment and roommates</p>
    </div>

    {/* Room card */}
    <div className="section-card">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-space-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-label-sm font-semibold uppercase">Floor {MOCK.floor}</span>
            <span className="text-label-sm text-outline">{MOCK.type} Sharing</span>
          </div>
          <h2 className="font-headline font-bold text-headline-lg text-on-surface">Room {MOCK.roomNumber}</h2>
          <p className="text-body-md text-on-surface-variant">Your bed: <strong className="text-primary">Bed {MOCK.bedLabel}</strong></p>
        </div>
        <div className="text-right">
          <p className="text-label-sm text-on-surface-variant">Monthly Rent</p>
          <p className="font-headline font-bold text-headline-lg text-on-surface tabular-nums">₹{MOCK.rent.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Bed grid */}
      <div className="mb-space-lg">
        <p className="label mb-3">Bed Occupancy</p>
        <div className="grid grid-cols-3 gap-3">
          {MOCK.beds.map((bed) => (
            <div key={bed.label}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 text-center
                ${bed.isMe
                  ? 'border-primary bg-primary-fixed/20'
                  : bed.status === 'OCCUPIED'
                    ? 'border-outline-variant bg-surface-container-low'
                    : 'border-dashed border-primary bg-primary-fixed/10'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-label-md
                ${bed.isMe ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'}`}>
                {bed.resident?.charAt(0) || '+'}
              </div>
              <div>
                <p className="font-semibold text-label-md text-on-surface">Bed {bed.label}</p>
                <p className="text-label-sm text-on-surface-variant truncate max-w-[90px]">
                  {bed.status === 'AVAILABLE' ? 'Vacant' : bed.resident}
                </p>
              </div>
              {bed.isMe && <span className="px-1.5 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold">YOU</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-space-lg">
        <p className="label mb-3">Room Amenities</p>
        <div className="flex flex-wrap gap-2">
          {MOCK.amenities.map((a) => (
            <span key={a} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary-fixed/20 text-primary text-label-sm font-medium">
              <Icon name="check_circle" size={14} />{a}
            </span>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="border-t border-outline-variant pt-space-md">
        <p className="label mb-3">My Tenancy Details</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Joining Date', value: new Date(MOCK.joiningDate).toLocaleDateString('en-IN') },
            { label: 'Monthly Rent', value: `₹${MOCK.monthlyRent.toLocaleString('en-IN')}` },
            { label: 'Security Deposit', value: `₹${MOCK.securityDeposit.toLocaleString('en-IN')}` },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-label-sm text-on-surface-variant font-medium uppercase tracking-wider">{f.label}</p>
              <p className="font-semibold text-on-surface mt-0.5">{f.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default MyRoom;
