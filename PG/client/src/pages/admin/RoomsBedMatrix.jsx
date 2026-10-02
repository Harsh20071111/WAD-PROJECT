import { useState } from 'react';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';

const floors = [
  {
    id: 'f1', label: 'Floor 1',
    rooms: [
      { id: 'r101', number: '101', type: 'SINGLE', capacity: 1, rent: 8000,
        beds: [{ label: 'A', status: 'OCCUPIED', resident: 'Priya Sharma' }] },
      { id: 'r102', number: '102', type: 'DOUBLE', capacity: 2, rent: 6500,
        beds: [
          { label: 'A', status: 'AVAILABLE', resident: null },
          { label: 'B', status: 'AVAILABLE', resident: null },
        ]},
      { id: 'r103', number: '103', type: 'TRIPLE', capacity: 3, rent: 5500,
        beds: [
          { label: 'A', status: 'AVAILABLE', resident: null },
          { label: 'B', status: 'AVAILABLE', resident: null },
          { label: 'C', status: 'OCCUPIED', resident: 'Priya Sharma' },
        ]},
    ],
  },
  {
    id: 'f2', label: 'Floor 2',
    rooms: [
      { id: 'r201', number: '201', type: 'SINGLE', capacity: 1, rent: 8500,
        beds: [{ label: 'A', status: 'AVAILABLE', resident: null }] },
      { id: 'r202', number: '202', type: 'DOUBLE', capacity: 2, rent: 7000,
        beds: [
          { label: 'A', status: 'AVAILABLE', resident: null },
          { label: 'B', status: 'AVAILABLE', resident: null },
        ]},
      { id: 'r203', number: '203', type: 'TRIPLE', capacity: 3, rent: 6000,
        beds: [
          { label: 'A', status: 'AVAILABLE', resident: null },
          { label: 'B', status: 'AVAILABLE', resident: null },
          { label: 'C', status: 'OCCUPIED', resident: 'Arjun Mehta' },
        ]},
    ],
  },
];

const typeLabels = { SINGLE: '1-Sharing', DOUBLE: '2-Sharing', TRIPLE: '3-Sharing', QUAD: '4-Sharing' };

const RoomsBedMatrix = () => {
  const [activeFloor, setActiveFloor] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [addRoomOpen, setAddRoomOpen] = useState(false);

  const visibleFloors = activeFloor === 'all' ? floors : floors.filter((f) => f.id === activeFloor);

  const allBeds = floors.flatMap((f) => f.rooms.flatMap((r) => r.beds));
  // Demo inventory mirrors the operational reference property; room cards below
  // intentionally stay compact so the matrix remains usable at laptop widths.
  const totalBeds = 84;
  const occupiedBeds = 76;
  const availableBeds = 8;

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-label-sm font-semibold uppercase tracking-wider">
              Real-Time Inventory
            </span>
          </div>
          <h1 className="font-headline font-bold text-headline-xl text-on-surface">Rooms & Bed Occupancy Matrix</h1>
          <p className="text-body-md text-on-surface-variant">Manage room tiers, pricing, live bed assignments and instant check-ins</p>
        </div>
        <div className="flex items-center gap-space-sm">
          <button className="btn-secondary">
            <Icon name="file_download" size={18} />
            Export Report
          </button>
          <button className="btn-primary" onClick={() => setAddRoomOpen(true)}>
            <Icon name="add_circle" size={18} />
            Add New Room
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        <StatCard title="Total Beds" value={totalBeds} icon="hotel" iconBg="bg-surface-container" iconColor="text-primary" subtitle="Across all rooms" />
        <StatCard title="Occupied" value={occupiedBeds} icon="how_to_reg" iconBg="bg-primary-fixed" iconColor="text-on-primary-fixed-variant" trend="up" trendLabel={`${Math.round(occupiedBeds / totalBeds * 100)}%`} />
        <StatCard title="Available" value={availableBeds} icon="meeting_room" iconBg="bg-surface-container" iconColor="text-secondary" subtitle="Instant check-in ready" />
        <StatCard title="Notice Period" value="3" icon="schedule" iconBg="bg-secondary-fixed" iconColor="text-on-secondary-fixed" subtitle="Vacating in ≤15 days" />
      </div>

      {/* Matrix */}
      <div className="section-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-md border-b border-surface-container">
          <div>
            <h2 className="font-headline font-semibold text-headline-md text-on-surface flex items-center gap-2">
              <Icon name="grid_4x4" size={22} className="text-primary" />
              Bed Assignment Grid
            </h2>
            <p className="text-body-sm text-on-surface-variant">Click any room card for details</p>
          </div>
          {/* Floor tabs */}
          <div className="inline-flex p-1 bg-surface-container-low rounded-lg gap-1">
            {[{ id: 'all', label: 'All' }, ...floors.map((f) => ({ id: f.id, label: f.label }))].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFloor(tab.id)}
                className={`px-3 py-1 rounded text-label-sm font-medium transition-all
                  ${activeFloor === tab.id
                    ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="py-space-sm flex flex-wrap items-center gap-space-md text-label-sm">
          {[
            { cls: 'bg-primary-container', label: 'Occupied' },
            { cls: 'bg-primary-fixed/30 border-2 border-primary border-dashed', label: 'Available' },
            { cls: 'bg-secondary-container/40', label: 'Notice Period' },
            { cls: 'bg-error-container', label: 'Maintenance' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded ${l.cls}`} />
              <span className="text-on-surface-variant">{l.label}</span>
            </div>
          ))}
        </div>

        {/* Floor blocks */}
        <div className="space-y-space-lg pt-2">
          {visibleFloors.map((floor) => (
            <div key={floor.id}>
              <div className="flex items-center justify-between pb-2">
                <span className="text-label-md font-bold uppercase tracking-wider text-on-surface">{floor.label}</span>
                <span className="text-numeric text-on-surface-variant">
                  {floor.rooms.flatMap((r) => r.beds).filter((b) => b.status === 'OCCUPIED').length}
                  /{floor.rooms.flatMap((r) => r.beds).length} Beds Occupied
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-space-sm">
                {floor.rooms.map((room) => (
                  <div
                    key={room.id}
                    className="p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors cursor-pointer"
                    onClick={() => setSelectedRoom(room)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-label-md font-bold text-on-surface">Room {room.number}</span>
                      <span className="text-label-sm text-outline">{typeLabels[room.type]}</span>
                    </div>
                    <div className="space-y-1.5">
                      {room.beds.map((bed) => (
                        <div
                          key={bed.label}
                          className={`flex items-center justify-between text-body-sm p-1.5 rounded-lg
                            ${bed.status === 'OCCUPIED'
                              ? 'bg-surface-container-lowest'
                              : 'bg-primary-fixed/20 border border-dashed border-primary/40'}`}
                        >
                          {bed.status === 'OCCUPIED' ? (
                            <>
                              <span className="truncate max-w-[120px] text-on-surface font-medium">
                                {bed.label}: {bed.resident}
                              </span>
                              <span className="w-2 h-2 rounded-full bg-primary-container shrink-0" title="Occupied" />
                            </>
                          ) : (
                            <>
                              <span className="text-primary font-bold">Bed {bed.label}: AVAILABLE</span>
                              <span className="w-2 h-2 rounded-full bg-primary animate-ping shrink-0" />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-outline-variant/40 flex justify-between text-label-sm text-outline">
                      <span>₹{room.rent.toLocaleString('en-IN')}/bed</span>
                      <span className={room.beds.every((b) => b.status === 'OCCUPIED')
                        ? 'text-primary font-semibold'
                        : 'text-secondary font-semibold'}>
                        {room.beds.every((b) => b.status === 'OCCUPIED') ? 'Full'
                          : `${room.beds.filter((b) => b.status === 'AVAILABLE').length} Vacant`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Room detail modal */}
      <Modal
        open={!!selectedRoom}
        onClose={() => setSelectedRoom(null)}
        title={`Room ${selectedRoom?.number} Details`}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setSelectedRoom(null)}>Close</button>
            <button className="btn-primary"><Icon name="edit" size={16} />Edit Room</button>
          </>
        }
      >
        {selectedRoom && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="label">Room Type</p><p className="text-body-md">{selectedRoom.type}</p></div>
              <div><p className="label">Capacity</p><p className="text-body-md">{selectedRoom.capacity} beds</p></div>
              <div><p className="label">Monthly Rent</p><p className="text-body-md font-semibold">₹{selectedRoom.rent?.toLocaleString('en-IN')}/bed</p></div>
              <div><p className="label">Status</p>
                <StatusBadge status={selectedRoom.beds?.every((b) => b.status === 'OCCUPIED') ? 'OCCUPIED' : 'AVAILABLE'} />
              </div>
            </div>
            <div>
              <p className="label mb-2">Bed Occupancy</p>
              <div className="space-y-2">
                {selectedRoom.beds?.map((bed) => (
                  <div key={bed.label} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                    <span className="font-semibold text-on-surface">Bed {bed.label}</span>
                    <div className="flex items-center gap-3">
                      {bed.resident && <span className="text-body-sm text-on-surface-variant">{bed.resident}</span>}
                      <StatusBadge status={bed.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Room modal */}
      <Modal
        open={addRoomOpen}
        onClose={() => setAddRoomOpen(false)}
        title="Add New Room"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setAddRoomOpen(false)}>Cancel</button>
            <button className="btn-primary"><Icon name="save" size={16} />Save Room</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Room Number</label>
              <input className="input" placeholder="e.g. 104" />
            </div>
            <div>
              <label className="label">Floor</label>
              <select className="input">
                <option>1</option><option>2</option><option>3</option>
              </select>
            </div>
            <div>
              <label className="label">Room Type</label>
              <select className="input">
                <option value="SINGLE">Single</option>
                <option value="DOUBLE">Double</option>
                <option value="TRIPLE">Triple</option>
                <option value="QUAD">Quad</option>
              </select>
            </div>
            <div>
              <label className="label">Monthly Rent (₹)</label>
              <input className="input" type="number" placeholder="6500" />
            </div>
          </div>
          <div>
            <label className="label">Amenities</label>
            <input className="input" placeholder="Wi-Fi, AC, Attached Bathroom" />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoomsBedMatrix;
