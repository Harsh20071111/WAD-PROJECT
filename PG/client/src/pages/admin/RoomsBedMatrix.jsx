import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';
import Button from '../../components/ui/Button';
import { assignBed, createRoom, getResidentsForAssignment, getRooms, getSummary, vacateBed } from '../../services/management';

const typeLabels = { SINGLE: '1-Sharing', DOUBLE: '2-Sharing', TRIPLE: '3-Sharing', QUAD: '4-Sharing' };
const typeCapacities = { SINGLE: 1, DOUBLE: 2, TRIPLE: 3, QUAD: 4 };

const AMENITY_OPTIONS = ['Wi-Fi', 'Attached Bathroom', 'AC', 'Geyser', 'Balcony', 'Work Desk', 'Wardrobe', 'TV', 'Hot Water'];

const defaultRoomData = {
  roomNumber: '',
  floor: '1',
  type: 'DOUBLE',
  capacity: 2,
  rent: '',
  amenities: ['Wi-Fi', 'Attached Bathroom']
};

const RoomsBedMatrix = () => {
  const [rooms, setRooms] = useState([]); const [summary, setSummary] = useState(null); const [residents, setResidents] = useState([]);
  const [activeFloor, setActiveFloor] = useState('all'); const [selectedRoom, setSelectedRoom] = useState(null); const [assigningBed, setAssigningBed] = useState(null);

  // Add Room modal state
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({ ...defaultRoomData });
  const [addRoomError, setAddRoomError] = useState('');
  const [addRoomLoading, setAddRoomLoading] = useState(false);

  const refresh = async () => { const [roomData, summaryData, residentData] = await Promise.all([getRooms(), getSummary(), getResidentsForAssignment()]); setRooms(roomData); setSummary(summaryData); setResidents(residentData); };
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => { refresh().catch(() => {}); }, []);
  useEffect(() => { if (searchParams.get('action') === 'addRoom') { setShowAddRoom(true); setSearchParams({}, { replace: true }); } }, [searchParams, setSearchParams]);
  const floors = useMemo(() => [...new Set(rooms.map((room) => room.floor))].sort((a, b) => a - b), [rooms]);
  const visibleRooms = activeFloor === 'all' ? rooms : rooms.filter((room) => String(room.floor) === activeFloor);
  const availableResidents = residents.filter((resident) => !resident.bedId);
  const assign = async (bedId, residentId) => { await assignBed(bedId, residentId); setAssigningBed(null); await refresh(); };
  const vacate = async (bedId) => { await vacateBed(bedId); setSelectedRoom(null); await refresh(); };

  // Add Room handlers
  const handleNewRoomChange = (field, value) => {
    setAddRoomError('');
    if (field === 'type') {
      setNewRoom((prev) => ({ ...prev, type: value, capacity: typeCapacities[value] || prev.capacity }));
    } else {
      setNewRoom((prev) => ({ ...prev, [field]: value }));
    }
  };

  const toggleAmenity = (amenity) => {
    setNewRoom((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleAddRoom = async () => {
    if (!newRoom.roomNumber.trim()) { setAddRoomError('Room number is required.'); return; }
    if (!newRoom.rent || Number(newRoom.rent) <= 0) { setAddRoomError('Rent must be a positive number.'); return; }
    setAddRoomLoading(true);
    try {
      await createRoom({
        roomNumber: newRoom.roomNumber.trim(),
        floor: Number(newRoom.floor),
        type: newRoom.type,
        capacity: Number(newRoom.capacity),
        rent: Number(newRoom.rent),
        amenities: newRoom.amenities,
      });
      setShowAddRoom(false);
      setNewRoom({ ...defaultRoomData });
      setAddRoomError('');
      await refresh();
    } catch (err) {
      setAddRoomError(err.response?.data?.message || 'Failed to create room. Please try again.');
    } finally {
      setAddRoomLoading(false);
    }
  };

  return <div className="flex flex-col w-full space-y-space-lg">
    <div className="page-header"><div><span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-label-sm font-semibold uppercase tracking-wider">Real-Time Inventory</span><h1 className="mt-2 font-headline font-bold text-headline-xl text-on-surface">Rooms & Bed Occupancy Matrix</h1><p className="text-body-md text-on-surface-variant">Live room assignments and bed status from MongoDB.</p></div><Button icon="add" onClick={() => setShowAddRoom(true)}>Add Room</Button></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md"><StatCard title="Total Beds" value={summary?.occupancy?.totalBeds ?? 0} icon="hotel" iconBg="bg-surface-container" iconColor="text-primary" subtitle="Across all rooms" /><StatCard title="Occupied" value={summary?.occupancy?.occupiedBeds ?? 0} icon="how_to_reg" iconBg="bg-primary-fixed" iconColor="text-on-primary-fixed-variant" /><StatCard title="Available" value={summary?.occupancy?.availableBeds ?? 0} icon="meeting_room" iconBg="bg-surface-container" iconColor="text-secondary" subtitle="Instant check-in ready" /><StatCard title="Notice Period" value={summary?.occupancy?.underNoticeBeds ?? 0} icon="schedule" iconBg="bg-secondary-fixed" iconColor="text-on-secondary-fixed" subtitle="Current bed status" /></div>
    <div className="section-card"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-md border-b border-surface-container"><div><h2 className="font-headline font-semibold text-headline-md text-on-surface flex items-center gap-2"><Icon name="grid_4x4" size={22} className="text-primary" />Bed Assignment Grid</h2><p className="text-body-sm text-on-surface-variant">Click any room card for details.</p></div><div className="inline-flex p-1 bg-surface-container-low rounded-lg gap-1"><button onClick={() => setActiveFloor('all')} className={`px-3 py-1 rounded text-label-sm font-medium ${activeFloor === 'all' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'}`}>All</button>{floors.map((floor) => <button key={floor} onClick={() => setActiveFloor(String(floor))} className={`px-3 py-1 rounded text-label-sm font-medium ${activeFloor === String(floor) ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'}`}>Floor {floor}</button>)}</div></div>
      <div className="space-y-space-lg pt-2">{floors.filter((floor) => activeFloor === 'all' || String(floor) === activeFloor).map((floor) => { const floorRooms = visibleRooms.filter((room) => room.floor === floor); return <div key={floor}><div className="flex items-center justify-between pb-2"><span className="text-label-md font-bold uppercase tracking-wider text-on-surface">Floor {floor}</span><span className="text-numeric text-on-surface-variant">{floorRooms.flatMap((room) => room.beds).filter((bed) => bed.status === 'OCCUPIED').length}/{floorRooms.flatMap((room) => room.beds).length} Beds Occupied</span></div><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-space-sm">{floorRooms.map((room) => <div key={room._id} className="p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors cursor-pointer" onClick={() => setSelectedRoom(room)}><div className="flex items-center justify-between mb-2"><span className="text-label-md font-bold text-on-surface">Room {room.roomNumber}</span><span className="text-label-sm text-outline">{typeLabels[room.type]}</span></div><div className="space-y-1.5">{room.beds.map((bed) => <div key={bed._id} className="flex items-center justify-between text-body-sm p-1.5 rounded-lg bg-surface-container-lowest"><span className="truncate max-w-[180px] text-on-surface font-medium">Bed {bed.label.replace(/^bed\s*/i, '')}: {bed.residentId?.userId?.name || bed.status}</span><StatusBadge status={bed.status} /></div>)}</div><div className="mt-2 pt-1.5 border-t border-outline-variant/40 flex justify-between text-label-sm text-outline"><span>₹{room.rent?.toLocaleString('en-IN')}/bed</span><span>{room.beds.filter((bed) => bed.status === 'AVAILABLE').length} Vacant</span></div></div>)}</div></div>; })}</div>
    </div>

    {/* Room Details Modal */}
    <Modal open={!!selectedRoom} onClose={() => setSelectedRoom(null)} title={`Room ${selectedRoom?.roomNumber || ''} Details`}><div className="space-y-3">{selectedRoom?.beds.map((bed) => <div key={bed._id} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low"><div><span className="font-semibold">Bed {bed.label.replace(/^bed\s*/i, '')}</span><p className="text-body-sm text-on-surface-variant">{bed.residentId?.userId?.name || bed.status}</p></div>{bed.residentId ? <button className="btn-secondary" onClick={() => vacate(bed._id)}>Vacate</button> : bed.status === 'AVAILABLE' ? <select className="input max-w-[180px]" defaultValue="" onChange={(event) => event.target.value && assign(bed._id, event.target.value)}><option value="">Assign resident</option>{availableResidents.map((resident) => <option key={resident._id} value={resident._id}>{resident.userId?.name || resident._id}</option>)}</select> : <StatusBadge status={bed.status} />}</div>)}</div></Modal>


    {/* Add Room Modal */}
    <Modal
      open={showAddRoom}
      onClose={() => { setShowAddRoom(false); setAddRoomError(''); setNewRoom({ ...defaultRoomData }); }}
      title="Add New Room"
      size="md"
      footer={
        <>
          <button className="btn-secondary min-h-10" onClick={() => { setShowAddRoom(false); setAddRoomError(''); setNewRoom({ ...defaultRoomData }); }}>Cancel</button>
          <Button icon="add" onClick={handleAddRoom} disabled={addRoomLoading}>
            {addRoomLoading ? 'Creating...' : 'Create Room'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {addRoomError && (
          <div className="flex items-center gap-2 rounded-lg bg-error-container p-3 text-body-sm text-on-error-container">
            <Icon name="error" size={18} />
            {addRoomError}
          </div>
        )}

        {/* Room Number & Floor */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-label-md font-medium text-on-surface mb-1.5 block">Room Number *</label>
            <input
              type="text"
              className="input w-full"
              placeholder="e.g. 301"
              value={newRoom.roomNumber}
              onChange={(e) => handleNewRoomChange('roomNumber', e.target.value)}
            />
          </div>
          <div>
            <label className="text-label-md font-medium text-on-surface mb-1.5 block">Floor *</label>
            <select
              className="input w-full"
              value={newRoom.floor}
              onChange={(e) => handleNewRoomChange('floor', e.target.value)}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((f) => (
                <option key={f} value={f}>Floor {f}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Room Type & Capacity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-label-md font-medium text-on-surface mb-1.5 block">Room Type *</label>
            <select
              className="input w-full"
              value={newRoom.type}
              onChange={(e) => handleNewRoomChange('type', e.target.value)}
            >
              <option value="SINGLE">Single (1 Bed)</option>
              <option value="DOUBLE">Double (2 Beds)</option>
              <option value="TRIPLE">Triple (3 Beds)</option>
              <option value="QUAD">Quad (4 Beds)</option>
            </select>
          </div>
          <div>
            <label className="text-label-md font-medium text-on-surface mb-1.5 block">Capacity</label>
            <input
              type="number"
              className="input w-full"
              min="1"
              max="10"
              value={newRoom.capacity}
              onChange={(e) => handleNewRoomChange('capacity', e.target.value)}
            />
            <p className="text-label-sm text-on-surface-variant mt-1">Beds auto-created (A, B, C…)</p>
          </div>
        </div>

        {/* Rent */}
        <div>
          <label className="text-label-md font-medium text-on-surface mb-1.5 block">Monthly Rent (per bed) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">₹</span>
            <input
              type="number"
              className="input w-full pl-7"
              placeholder="e.g. 6500"
              min="0"
              value={newRoom.rent}
              onChange={(e) => handleNewRoomChange('rent', e.target.value)}
            />
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="text-label-md font-medium text-on-surface mb-2 block">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map((amenity) => (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`rounded-full border px-3 py-1.5 text-label-sm font-medium transition-colors ${
                  newRoom.amenities.includes(amenity)
                    ? 'border-primary bg-primary-fixed text-on-primary-fixed-variant'
                    : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {newRoom.amenities.includes(amenity) && <Icon name="check" size={14} className="inline mr-1" />}
                {amenity}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  </div>;
};
export default RoomsBedMatrix;
