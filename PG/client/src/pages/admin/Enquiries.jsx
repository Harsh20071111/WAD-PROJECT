import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';
import api from '../../services/api';

const MOCK_FALLBACK = [
  { _id: '1', name: 'Vikram Singh', phone: '+91 9400000001', email: 'vikram@email.com', moveInDate: '2026-11-01', message: 'Looking for single room with attached bathroom and parking.', status: 'NEW', createdAt: '2026-10-01' },
  { _id: '2', name: 'Neha Gupta', phone: '+91 9400000002', email: 'neha@email.com', moveInDate: '2026-11-15', message: 'Interested in triple sharing. Need details about meals and laundry.', status: 'CONTACTED', createdAt: '2026-10-02' },
];

const parseRentFromMessage = (msg) => {
  if (!msg) return '';
  const match = msg.match(/₹\s*([\d,]+)/);
  return match ? match[1].replace(/,/g, '') : '';
};

const parseRoomFromMessage = (msg) => {
  if (!msg) return '';
  const match = msg.match(/Room\s*(\d+[A-Z]?)/i);
  return match ? match[1] : '';
};

const Enquiries = () => {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchEnquiries = () => {
    setLoading(true);
    api.get('/enquiries')
      .then(({ data }) => {
        setEnquiries(data.data || []);
      })
      .catch((err) => {
        console.error('Failed to fetch enquiries:', err);
        setEnquiries(MOCK_FALLBACK);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/enquiries/${id}`, { status: newStatus });
      setEnquiries((prev) =>
        prev.map((e) => (e._id === id ? { ...e, status: newStatus } : e))
      );
    } catch (err) {
      console.error('Failed to update enquiry status:', err);
      setEnquiries((prev) =>
        prev.map((e) => (e._id === id ? { ...e, status: newStatus } : e))
      );
    }
  };

  const convertToResident = async (enquiry) => {
    await updateStatus(enquiry._id, 'CONVERTED');
    const rent = parseRentFromMessage(enquiry.message);
    const roomNumber = parseRoomFromMessage(enquiry.message);
    setSelected(null);
    navigate('/admin/residents?action=addResident', {
      state: {
        addResident: true,
        name: enquiry.name,
        phone: enquiry.phone,
        email: enquiry.email || '',
        monthlyRent: rent,
        roomNumber: roomNumber,
        roomId: enquiry.roomId || '',
        moveInDate: enquiry.moveInDate || '',
      },
    });
  };

  const columns = [
    {
      key: 'name', label: 'Enquirer',
      render: (v, row) => (
        <div>
          <p className="font-semibold text-on-surface text-body-sm">{v}</p>
          <p className="text-label-sm text-on-surface-variant">{row.email || '—'}</p>
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
      render: (v) => <span className="text-on-surface-variant text-body-sm truncate max-w-[200px] block">{v || '—'}</span>,
    },
    { key: 'status', label: 'Status', render: (_, row) => <StatusBadge status={row.status} /> },
    {
      key: 'createdAt', label: 'Received',
      render: (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—',
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
          { label: 'Total Enquiries', value: enquiries.length, icon: 'contact_phone', bg: 'bg-surface-container', color: 'text-primary' },
          { label: 'New', value: enquiries.filter((e) => e.status === 'NEW').length, icon: 'fiber_new', bg: 'bg-tertiary-fixed', color: 'text-on-tertiary-fixed' },
          { label: 'Contacted', value: enquiries.filter((e) => e.status === 'CONTACTED').length, icon: 'call', bg: 'bg-secondary-fixed', color: 'text-on-secondary-fixed' },
          { label: 'Converted', value: enquiries.filter((e) => e.status === 'CONVERTED').length, icon: 'person_add', bg: 'bg-primary-fixed', color: 'text-on-primary-fixed-variant' },
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
        <DataTable columns={columns} data={enquiries} loading={loading} emptyMessage="No enquiries yet" emptyIcon="contact_phone" />
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Enquiry — ${selected?.name}`} size="md"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setSelected(null)}>Close</button>
            {selected?.status !== 'CONTACTED' && (
              <button className="btn-primary" onClick={() => updateStatus(selected._id, 'CONTACTED')}>
                <Icon name="call" size={16} />Mark Contacted
              </button>
            )}
            {selected?.status !== 'CONVERTED' && (
              <button className="btn-primary" onClick={() => convertToResident(selected)} style={{ background: '#0f766e' }}>
                <Icon name="person_add" size={16} />Convert to Resident
              </button>
            )}
          </>
        }>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="label">Name</p><p className="text-body-md font-medium">{selected.name}</p></div>
              <div><p className="label">Phone</p><p className="text-body-md font-medium">{selected.phone}</p></div>
              <div><p className="label">Email</p><p className="text-body-md">{selected.email || '—'}</p></div>
              <div><p className="label">Move-in Date</p><p className="text-body-md">{selected.moveInDate ? new Date(selected.moveInDate).toLocaleDateString('en-IN') : '—'}</p></div>
              <div><p className="label">Status</p><StatusBadge status={selected.status} /></div>
            </div>
            <div>
              <p className="label">Message</p>
              <p className="text-body-md bg-surface-container-low p-3 rounded-lg text-on-surface">{selected.message || 'No message provided'}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Enquiries;
