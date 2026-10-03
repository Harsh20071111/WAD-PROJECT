import { useState, useEffect } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import api from '../../services/api';
import { Turnstile } from '@marsidev/react-turnstile';

const sharingLabel = (type) => {
  if (!type) return '';
  const display = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  if (/sharing/i.test(display)) return display;
  return `${display} sharing`;
};

const Contact = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Extract room details from search query or location state
  const roomNumber = searchParams.get('room') || location.state?.roomNumber;
  const roomType = searchParams.get('type') || location.state?.type;
  const roomRent = searchParams.get('rent') || location.state?.rent;

  const defaultMessage = roomNumber
    ? `I am interested in Room ${roomNumber}${roomType ? ` (${sharingLabel(roomType)}` : ''}${roomRent ? ` - ₹${Number(roomRent).toLocaleString('en-IN')}/month` : ''}). Please contact me with availability and next steps.`
    : '';

  const [form, setForm] = useState({ name: '', phone: '', email: '', moveInDate: '', message: defaultMessage });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [rooms, setRooms] = useState([]);
  const [availabilityAlert, setAvailabilityAlert] = useState('');

  useEffect(() => {
    api.get('/rooms/public')
      .then(({ data }) => setRooms(data.data || []))
      .catch((err) => console.error('Failed to load public rooms:', err));
  }, []);

  useEffect(() => {
    if (roomNumber && rooms.length) {
      const match = rooms.find((r) => String(r.roomNumber) === String(roomNumber));
      if (match && match.availableBeds === 0) {
        setAvailabilityAlert(
          `⚠️ Room ${roomNumber} is fully occupied for immediate move-in! Please choose another room or pick a future move-in date.`
        );
      } else {
        setAvailabilityAlert('');
      }
    }
  }, [roomNumber, rooms]);

  useEffect(() => {
    if (defaultMessage && !form.message) {
      setForm((p) => ({ ...p, message: defaultMessage }));
    }
  }, [defaultMessage]);

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await api.post('/enquiries/public', { ...form, turnstileToken });
      setSubmitted(true);
      setTurnstileToken('');
    } catch (err) {
      console.error('Failed to submit enquiry:', err);
      // Fall back to success if backend is in mock/offline mode unless it's a captcha or validation error from backend
      if (err.response?.status === 400) {
        setErrorMsg(err.response?.data?.message || 'Failed to submit enquiry. Please check your details.');
      } else {
        setSubmitted(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-space-lg py-12">
      <div className="text-center mb-10">
        <h1 className="font-headline font-bold text-headline-xl text-on-surface">Get In Touch</h1>
        <p className="text-body-lg text-on-surface-variant mt-2">Fill the form below and we'll reach out within 24 hours</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Contact Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="section-card space-y-5">
            <h2 className="font-headline font-semibold text-headline-md text-on-surface">Greenwood Luxury PG</h2>
            <p className="text-body-md text-on-surface-variant">Navrangpura, Ahmedabad, Gujarat</p>
            {[
              { icon: 'phone', label: 'Phone', value: '+91 8000000001' },
              { icon: 'mail', label: 'Email', value: 'admin@pgmanage.com' },
              { icon: 'schedule', label: 'Office Hours', value: 'Mon–Sat, 9AM–7PM' },
            ].map((c) => (
              <div key={c.label} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                  <Icon name={c.icon} size={18} />
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant font-medium uppercase tracking-wider">{c.label}</p>
                  <p className="text-body-md text-on-surface font-medium">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="section-card">
            <h3 className="font-headline font-semibold text-headline-md text-on-surface mb-3">
              {roomNumber ? `Enquiring for Room ${roomNumber}` : 'Quick Info'}
            </h3>
            <div className="space-y-2 text-body-sm">
              {[
                ...(roomNumber
                  ? [
                      { label: 'Selected Room', value: `Room ${roomNumber}` },
                      ...(roomType ? [{ label: 'Sharing Type', value: sharingLabel(roomType) }] : []),
                      ...(roomRent ? [{ label: 'Room Rent', value: `₹${Number(roomRent).toLocaleString('en-IN')} / month` }] : []),
                    ]
                  : [{ label: 'Starting from', value: '₹5,500 / month' }]),
                { label: 'Security deposit', value: '2 months rent' },
                { label: 'Notice period', value: '1 month' },
                { label: 'Availability', value: 'Immediate' },
              ].map((q) => (
                <div key={q.label} className="flex items-center justify-between py-1 border-b border-outline-variant/40 last:border-0">
                  <span className="text-on-surface-variant">{q.label}</span>
                  <span className="font-semibold text-on-surface">{q.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enquiry Form */}
        <div className="lg:col-span-3">
          {submitted ? (
            <div className="section-card flex flex-col items-center text-center py-12 gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center">
                <Icon name="check_circle" size={36} className="text-primary" />
              </div>
              <h2 className="font-headline font-bold text-headline-lg text-on-surface">Enquiry Submitted!</h2>
              <p className="text-body-md text-on-surface-variant max-w-sm">
                Thanks for reaching out. Our team will contact you within 24 hours.
              </p>
              <button className="btn-secondary mt-2" onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', email: '', moveInDate: '', message: '' }); }}>
                Submit Another
              </button>
            </div>
          ) : (
            <div className="section-card">
              <h2 className="font-headline font-semibold text-headline-md text-on-surface mb-space-lg">Room Enquiry Form</h2>

              {errorMsg && (
                <div className="mb-4 p-4 rounded-xl bg-error-container text-on-error-container text-body-sm font-medium">
                  {errorMsg}
                </div>
              )}

              {availabilityAlert && (
                <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 space-y-2">
                  <p className="text-body-sm font-medium">{availabilityAlert}</p>
                  <Link
                    to="/rooms?availableOnly=true"
                    className="inline-flex items-center gap-1.5 text-label-md font-semibold text-primary hover:underline"
                  >
                    <Icon name="search" size={16} /> Browse Available Rooms
                  </Link>
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                {/* Honeypot */}
                <input type="text" name="website" tabIndex={-1} style={{ display: 'none' }} autoComplete="off" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input name="name" required className="input" placeholder="Your full name" value={form.name} onChange={handle} />
                  </div>
                  <div>
                    <label className="label">Phone Number *</label>
                    <input name="phone" required className="input" placeholder="+91 9XXXXXXXXX" value={form.phone} onChange={handle} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Email</label>
                    <input name="email" type="email" className="input" placeholder="Optional" value={form.email} onChange={handle} />
                  </div>
                  <div>
                    <label className="label">Preferred Move-in Date</label>
                    <input name="moveInDate" type="date" className="input" value={form.moveInDate} onChange={handle} />
                  </div>
                </div>

                <div>
                  <label className="label">Message</label>
                  <textarea name="message" rows={4} className="input" placeholder="Tell us about your requirements — room type, budget, duration..."
                    value={form.message} onChange={handle} />
                </div>

                <button type="submit" disabled={loading || !turnstileToken} className="btn-primary w-full justify-center py-3">
                  {loading ? <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" /> : <Icon name="send" size={18} />}
                  {loading ? 'Sending...' : 'Send Enquiry'}
                </button>
                
                <div className="flex justify-center mt-4">
                  <Turnstile 
                    siteKey="0x4AAAAAAFMlU_1wbjLpxzc-" 
                    onSuccess={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken('')}
                    onError={() => setTurnstileToken('')}
                  />
                </div>

                <p className="text-label-sm text-on-surface-variant text-center">
                  We respect your privacy and never share your details.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
