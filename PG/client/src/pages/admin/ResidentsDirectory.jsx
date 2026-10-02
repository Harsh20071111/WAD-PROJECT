import { useState } from 'react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import StatCard from '../../components/StatCard';
import Icon from '../../components/Icon';

const MOCK_RESIDENTS = [
  {
    _id: '1', name: 'Priya Sharma', email: 'priya@resident.com', phone: '+91 9200000001',
    room: '103-C', joiningDate: '2025-01-01', monthlyRent: 5500, gender: 'FEMALE',
    status: 'ACTIVE', kyc: 'VERIFIED', securityDeposit: 11000,
  },
  {
    _id: '2', name: 'Arjun Mehta', email: 'arjun@resident.com', phone: '+91 9200000002',
    room: '203-C', joiningDate: '2025-02-01', monthlyRent: 6000, gender: 'MALE',
    status: 'ACTIVE', kyc: 'PENDING', securityDeposit: 12000,
  },
  {
    _id: '3', name: 'Sneha Patel', email: 'sneha@gmail.com', phone: '+91 9200000003',
    room: '—', joiningDate: '2025-03-15', monthlyRent: 7000, gender: 'FEMALE',
    status: 'PENDING_VERIFICATION', kyc: 'UPLOADED', securityDeposit: 14000,
  },
];

const ResidentsDirectory = () => {
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('ALL');
  const [selected, setSelected]     = useState(null);
  const [addOpen, setAddOpen]       = useState(false);

  const filtered = MOCK_RESIDENTS.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search);
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      key: 'name', label: 'Resident',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-label-md font-bold shrink-0">
            {v.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-on-surface text-body-sm">{v}</p>
            <p className="text-label-sm text-on-surface-variant">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', label: 'Phone' },
    { key: 'room', label: 'Room / Bed' },
    {
      key: 'joiningDate', label: 'Joining Date',
      render: (v) => new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    {
      key: 'monthlyRent', label: 'Monthly Rent',
      render: (v) => <span className="tabular-nums font-semibold">₹{v.toLocaleString('en-IN')}</span>,
    },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'kyc', label: 'KYC', render: (v) => <StatusBadge status={v} /> },
    {
      key: '_id', label: 'Actions',
      render: (_, row) => (
        <button
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors"
          onClick={() => setSelected(row)}
        >
          <Icon name="open_in_new" size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="font-headline font-bold text-headline-xl text-on-surface">Residents Directory</h1>
          <p className="text-body-md text-on-surface-variant">Manage all residents — profiles, rooms, KYC, and payments</p>
        </div>
        <div className="flex items-center gap-space-sm">
          <button className="btn-secondary"><Icon name="file_download" size={18} />Export</button>
          <button className="btn-primary" onClick={() => setAddOpen(true)}>
            <Icon name="person_add" size={18} />Add Resident
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
        <StatCard title="Total Residents" value={MOCK_RESIDENTS.length} icon="groups" iconBg="bg-surface-container" iconColor="text-primary" />
        <StatCard title="Active" value={MOCK_RESIDENTS.filter((r) => r.status === 'ACTIVE').length} icon="how_to_reg" iconBg="bg-primary-fixed" iconColor="text-on-primary-fixed-variant" />
        <StatCard title="KYC Pending" value={MOCK_RESIDENTS.filter((r) => r.kyc !== 'VERIFIED').length} icon="verified_user" iconBg="bg-secondary-fixed" iconColor="text-on-secondary-fixed" />
        <StatCard title="Notice Period" value={MOCK_RESIDENTS.filter((r) => r.status === 'NOTICE_PERIOD').length} icon="notification_important" iconBg="bg-error-container" iconColor="text-on-error-container" />
      </div>

      {/* Table */}
      <div className="section-card">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-space-sm mb-space-md">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <Icon name="search" size={16} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone..."
              className="input pl-9"
            />
          </div>
          <div className="flex gap-1 p-1 bg-surface-container-low rounded-lg">
            {['ALL', 'ACTIVE', 'NOTICE_PERIOD', 'PENDING_VERIFICATION', 'CHECKED_OUT'].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-2.5 py-1 rounded text-label-sm font-medium transition-all whitespace-nowrap
                  ${statusFilter === s ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {s === 'ALL' ? 'All' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage="No residents found"
          emptyIcon="badge"
        />
      </div>

      {/* Resident detail modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name}
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setSelected(null)}>Close</button>
            <button className="btn-danger"><Icon name="logout" size={16} />Checkout</button>
            <button className="btn-primary"><Icon name="edit" size={16} />Edit</button>
          </>
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-on-primary text-headline-md font-bold">
                {selected.name.charAt(0)}
              </div>
              <div>
                <p className="font-headline font-semibold text-headline-md text-on-surface">{selected.name}</p>
                <p className="text-body-sm text-on-surface-variant">{selected.email} · {selected.phone}</p>
                <div className="flex gap-2 mt-1">
                  <StatusBadge status={selected.status} />
                  <StatusBadge status={selected.kyc} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Room / Bed', value: selected.room },
                { label: 'Gender', value: selected.gender },
                { label: 'Joining Date', value: new Date(selected.joiningDate).toLocaleDateString('en-IN') },
                { label: 'Monthly Rent', value: `₹${selected.monthlyRent?.toLocaleString('en-IN')}` },
                { label: 'Security Deposit', value: `₹${selected.securityDeposit?.toLocaleString('en-IN')}` },
              ].map((f) => (
                <div key={f.label}>
                  <p className="label">{f.label}</p>
                  <p className="text-body-md text-on-surface font-medium">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Add resident modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Resident" size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="btn-primary"><Icon name="save" size={16} />Save Resident</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Full Name</label><input className="input" placeholder="Priya Sharma" /></div>
            <div><label className="label">Email</label><input className="input" type="email" placeholder="priya@example.com" /></div>
            <div><label className="label">Phone</label><input className="input" placeholder="+91 9XXXXXXXXX" /></div>
            <div><label className="label">Gender</label>
              <select className="input"><option>MALE</option><option>FEMALE</option><option>OTHER</option></select>
            </div>
            <div><label className="label">Joining Date</label><input className="input" type="date" /></div>
            <div><label className="label">Monthly Rent (₹)</label><input className="input" type="number" placeholder="5500" /></div>
            <div><label className="label">Security Deposit (₹)</label><input className="input" type="number" placeholder="11000" /></div>
            <div><label className="label">Assign Room</label>
              <select className="input"><option>Room 101</option><option>Room 102</option><option>Room 103</option></select>
            </div>
          </div>
          <div><label className="label">Password</label><input className="input" type="password" placeholder="Temporary password" /></div>
        </div>
      </Modal>
    </div>
  );
};

export default ResidentsDirectory;
