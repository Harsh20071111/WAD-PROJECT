import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import Icon from '../../components/Icon';
import api from '../../services/api';

// Room images by type (fallback when no photos from API)
const ROOM_IMAGES = {
  SINGLE: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80',
  DOUBLE: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=900&q=80',
  TRIPLE: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80',
  QUAD:   'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80',
};

/**
 * Normalize a room type into a human-readable sharing label.
 * "SINGLE" → "Single sharing", "DOUBLE" → "Double sharing", etc.
 * If the type already contains "Sharing" (case-insensitive), return as-is.
 */
const sharingLabel = (type) => {
  if (!type) return '';
  // Capitalize first letter, lowercase rest for display
  const display = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  if (/sharing/i.test(display)) return display;
  return `${display} sharing`;
};

const RoomSkeleton = () => <Card className="overflow-hidden"><Skeleton className="h-48 rounded-none" /><div className="space-y-3 p-5"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-1/3" /><Skeleton className="h-10 w-full" /></div></Card>;

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [type, setType] = useState('All');
  const [floor, setFloor] = useState('All floors');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/rooms/public')
      .then(({ data }) => {
        setRooms(data.data || []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // Derive unique floors from real data
  const floors = useMemo(() => {
    const set = new Set(rooms.map((r) => r.floor));
    return [...set].sort((a, b) => a - b);
  }, [rooms]);

  // Derive unique types for filter tabs
  const types = useMemo(() => {
    const set = new Set(rooms.map((r) => r.type));
    return [...set];
  }, [rooms]);

  const totalAvailable = useMemo(() => rooms.reduce((sum, r) => sum + r.availableBeds, 0), [rooms]);

  const filtered = useMemo(() =>
    rooms.filter((room) =>
      (type === 'All' || room.type === type) &&
      (floor === 'All floors' || room.floor === Number(floor)) &&
      (!availableOnly || room.availableBeds > 0)
    ), [rooms, type, floor, availableOnly]);

  return <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-label-sm font-semibold uppercase tracking-wider text-primary">Greenwood Luxury PG</p>
        <h1 className="font-headline text-headline-xl font-bold tracking-tight">Find your room</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Live availability across all floors. Prices shown per bed, per month.</p>
      </div>
      {!loading && !error && (
        <p className="text-label-md text-on-surface-variant">
          <span className="font-semibold text-primary">{totalAvailable} bed{totalAvailable !== 1 ? 's' : ''}</span> available now
        </p>
      )}
    </div>

    {/* ── Filters ── */}
    <div className="sticky top-16 z-20 mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-card backdrop-blur-sm sm:flex-row sm:items-center">
      <div className="flex gap-1 overflow-x-auto">
        {['All', ...types].map((option) => (
          <button key={option} onClick={() => setType(option)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-label-md ${type === option ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
            {option === 'All' ? 'All' : sharingLabel(option).replace(/ sharing$/i, '')}
          </button>
        ))}
      </div>
      <div className="flex gap-2 sm:ml-auto">
        <select value={floor} onChange={(e) => setFloor(e.target.value)} className="input min-h-10 w-auto">
          <option>All floors</option>
          {floors.map((f) => <option key={f} value={f}>Floor {f}</option>)}
        </select>
        <button onClick={() => setAvailableOnly((value) => !value)} className={`min-h-10 whitespace-nowrap rounded-lg border px-3 text-label-md ${availableOnly ? 'border-primary bg-primary-fixed text-on-primary-fixed-variant' : 'border-outline-variant text-on-surface-variant'}`}>
          <Icon name="check_circle" size={16} /> Available only
        </button>
      </div>
    </div>

    {/* ── Room Grid ── */}
    {loading ? (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <RoomSkeleton key={index} />)}</div>
    ) : error ? (
      <div className="py-8">
        <p className="text-center text-body-md text-on-surface-variant">Unable to load rooms. Please try again later.</p>
      </div>
    ) : filtered.length ? (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((room) => (
          <Card key={room.roomNumber} className="group overflow-hidden">
            <div className="relative h-48 overflow-hidden bg-surface-container">
              <img src={ROOM_IMAGES[room.type] || ROOM_IMAGES.DOUBLE} alt={`Room ${room.roomNumber}`} className="h-full w-full object-cover transition-transform duration-150 group-hover:scale-[1.02]" />
              <span className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-label-sm font-semibold ${room.availableBeds ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white/95 text-slate-600'}`}>
                {room.availableBeds ? `${room.availableBeds} bed${room.availableBeds > 1 ? 's' : ''} available` : 'Fully occupied'}
              </span>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-headline text-headline-md font-semibold">Room {room.roomNumber}</h2>
                  <p className="mt-1 text-body-sm text-on-surface-variant">{sharingLabel(room.type)} · Floor {room.floor}</p>
                </div>
                <div className="text-right">
                  <p className="font-headline text-lg font-bold tabular-nums text-primary">₹{room.rent.toLocaleString('en-IN')}</p>
                  <p className="text-label-sm text-on-surface-variant">per bed / month</p>
                </div>
              </div>
              {room.amenities.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {room.amenities.map((amenity) => <span key={amenity} className="rounded-full bg-surface-container-low px-2.5 py-1 text-label-sm text-on-surface-variant">{amenity}</span>)}
                </div>
              )}
              <div className="mt-5 flex gap-2 border-t border-slate-200 pt-4">
                <Button variant="secondary" className="flex-1 min-h-10">View Details</Button>
                <Link className="flex-1" to="/contact"><Button className="w-full min-h-10">Enquire</Button></Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    ) : (
      <div className="py-8">
        <p className="text-center text-body-md text-on-surface-variant">No rooms match your filters.</p>
        <button onClick={() => { setType('All'); setFloor('All floors'); setAvailableOnly(false); }} className="mx-auto mt-3 block text-label-md font-semibold text-primary">Clear filters</button>
      </div>
    )}
  </div>;
};

export default Rooms;
