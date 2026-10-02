import { useState } from 'react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';

const MOCK = [
  { _id: '1', name: 'Vikram Singh', phone: '+91 9400000001', email: 'vikram@email.com', moveInDate: '2026-11-01', message: 'Looking for single room with attached bathroom and parking.', status: 'NEW', createdAt: '2026-10-01' },
  { _id: '2', name: 'Neha Gupta', phone: '+91 9400000002', email: 'neha@email.com', moveInDate: '2026-11-15', message: 'Interested in triple sharing. Need details about meals and laundry.', status: 'CONTACTED', createdAt: '2026-10-02' },
];

const Enquiries = () => {
  const [selected, setSelected] = useState(null);
  const [statusMap, setStatusMap] = useState({});

  const getStatus = (row) => statusMap[row._id] || row.status;

  const columns = [
    {
      key: 'name', label: 'Enquirer',
      render: (v, row) => (
        <div>
          <p className="font-semibold text-on-surface text-body-sm">{v}</p>
          <p className="text-label-sm text-on-surface-variant">{row.email}</p>
        </div>
      ),
    },
    { key: 'phone', label: 'Phone' },
    {
      key: 'moveInDate', label: 'Move-in',
      render: (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
    },
    {
      key: 'message', label: 'Message',
      render: (v) => <span className="text-on-surface-variant text-body-sm truncate max-w-[200px] block">{v}</span>,
    },
    { key: 'status', label: 'Status', render: (_, row) => <StatusBadge status={getStatus(row)} /> },
    {
      key: 'createdAt', label: 'Received',
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
    <div className="flex flex-col w-full space-y-space-lg">
      <div>
        <h1 className="font-headline font-bold text-headline-xl text-on-surface">Enquiries & Leads</h1>
        <p className="text-body-md text-on-surface-variant">Manage room enquiries from prospective residents</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
        {[
          { label: 'Total Enquiries', value: MOCK.length, icon: 'contact_phone', bg: 'bg-surface-container', color: 'text-primary' },
          { label: 'New', value: MOCK.filter((e) => e.status === 'NEW').length, icon: 'fiber_new', bg: 'bg-tertiary-fixed', color: 'text-on-tertiary-fixed' },
          { label: 'Contacted', value: MOCK.filter((e) => e.status === 'CONTACTED').length, icon: 'call', bg: 'bg-secondary-fixed', color: 'text-on-secondary-fixed' },
          { label: 'Converted', value: MOCK.filter((e) => e.status === 'CONVERTED').length, icon: 'person_add', bg: 'bg-primary-fixed', color: 'text-on-primary-fixed-variant' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">{s.label}</span>
              <span className={`${s.bg} ${s.color} p-1.5 rounded-lg`}><Icon name={s.icon} size={18} /></span>
            </div>
            <span className="font-headline font-bold text-headline-lg text-on-surface">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="section-card">
        <DataTable columns={columns} data={MOCK} emptyMessage="No enquiries yet" emptyIcon="contact_phone" />
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Enquiry — ${selected?.name}`} size="md"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setSelected(null)}>Close</button>
            <button className="btn-primary" onClick={() => {
              setStatusMap((p) => ({ ...p, [selected._id]: 'CONTACTED' }));
              setSelected(null);
            }}>
              <Icon name="call" size={16} />Mark Contacted
            </button>
            <button className="btn-primary" onClick={() => {
              setStatusMap((p) => ({ ...p, [selected._id]: 'CONVERTED' }));
              setSelected(null);
            }} style={{ background: '#0f766e' }}>
              <Icon name="person_add" size={16} />Convert to Resident
            </button>
          </>
        }>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="label">Name</p><p className="text-body-md font-medium">{selected.name}</p></div>
              <div><p className="label">Phone</p><p className="text-body-md font-medium">{selected.phone}</p></div>
              <div><p className="label">Email</p><p className="text-body-md">{selected.email || '—'}</p></div>
              <div><p className="label">Move-in Date</p><p className="text-body-md">{selected.moveInDate ? new Date(selected.moveInDate).toLocaleDateString('en-IN') : '—'}</p></div>
              <div><p className="label">Status</p><StatusBadge status={getStatus(selected)} /></div>
            </div>
            <div>
              <p className="label">Message</p>
              <p className="text-body-md bg-surface-container-low p-3 rounded-lg text-on-surface">{selected.message}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Enquiries;
