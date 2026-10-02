import { useState, useEffect } from 'react';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';
import { getRoomsMatrix, updateRoom, assignBed, checkoutBed, createRoom } from '../../services/roomService';

const typeLabels = { SINGLE: '1-Sharing', DOUBLE: '2-Sharing', TRIPLE: '3-Sharing', QUAD: '4-Sharing' };

const defaultRoomData = {
  roomNumber: '',
  floor: '1',
  type: 'DOUBLE',
  capacity: 2,
  rent: '',
  amenities: ['Wi-Fi', 'Attached Bathroom']
};

const RoomsBedMatrix = () => {
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFloor, setActiveFloor] = useState('all');
  
  // Room modal state
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [editingRoomData, setEditingRoomData] = useState({});
  
  // Add person modal state
  const [assigningBed, setAssigningBed] = useState(null);
  const [assignFormData, setAssignFormData] = useState({
    name: '', phone: '', email: '', checkInDate: '', emergencyContact: { name: '', relation: '', phone: '' }
  });
  
  // Add Room modal state & form
  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [newRoomData, setNewRoomData] = useState(defaultRoomData);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmittingRoom, setIsSubmittingRoom] = useState(false);
  const [addRoomError, setAddRoomError] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', text: '' }

  // Auto-dismiss toast after 5s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleTypeChange = (newType) => {
    const capacityMap = { SINGLE: 1, DOUBLE: 2, TRIPLE: 3, QUAD: 4 };
    setNewRoomData(prev => ({
      ...prev,
      type: newType,
      capacity: capacityMap[newType] || prev.capacity
    }));
    if (formErrors.type) {
      setFormErrors(prev => ({ ...prev, type: null }));
    }
  };

  const handleAmenityToggle = (amenity) => {
    setNewRoomData(prev => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter(a => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

  const handleCloseAddRoomModal = () => {
    if (isSubmittingRoom) return;
    setAddRoomOpen(false);
    setNewRoomData(defaultRoomData);
    setFormErrors({});
    setAddRoomError(null);
  };

  const validateNewRoom = () => {
    const errors = {};
    const trimmedNumber = newRoomData.roomNumber ? newRoomData.roomNumber.toString().trim() : '';
    if (!trimmedNumber) {
      errors.roomNumber = 'Room number is required';
    } else {
      // Check uniqueness against loaded rooms
      const exists = floors
        .flatMap(f => f.rooms)
        .some(r => r.number.toString().trim().toLowerCase() === trimmedNumber.toLowerCase());
      if (exists) {
        errors.roomNumber = `Room ${trimmedNumber} already exists`;
      }
    }

    if (newRoomData.floor === '' || newRoomData.floor === undefined || isNaN(Number(newRoomData.floor)) || Number(newRoomData.floor) < 0) {
      errors.floor = 'Valid floor number is required (0 or higher)';
    }

    if (!['SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD'].includes(newRoomData.type)) {
      errors.type = 'Select a valid room type';
    }

    const cap = Number(newRoomData.capacity);
    if (!cap || isNaN(cap) || cap < 1) {
      errors.capacity = 'Capacity must be at least 1 bed';
    }

    if (newRoomData.rent === '' || newRoomData.rent === undefined || isNaN(Number(newRoomData.rent)) || Number(newRoomData.rent) < 0) {
      errors.rent = 'Valid rent per bed is required (₹0 or higher)';
    }

    return errors;
  };

  const handleCreateRoom = async (e) => {
    if (e) e.preventDefault();
    if (isSubmittingRoom) return;

    const errors = validateNewRoom();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setAddRoomError(null);
    setIsSubmittingRoom(true);

    const payload = {
      roomNumber: newRoomData.roomNumber.toString().trim(),
      floor: Number(newRoomData.floor),
      type: newRoomData.type,
      capacity: Number(newRoomData.capacity),
      rent: Number(newRoomData.rent),
      amenities: newRoomData.amenities
    };

    try {
      const response = await createRoom(payload);
      
      // Refresh rooms matrix from server
      await fetchRooms();

      // Show success toast
      setToast({
        type: 'success',
        text: response?.message || `Room ${payload.roomNumber} added successfully.`
      });

      // Switch active floor tab to the new room's floor if currently filtered
      setActiveFloor(prev => (prev === 'all' ? 'all' : `f${payload.floor}`));

      // Reset form and close modal
      setNewRoomData(defaultRoomData);
      setAddRoomOpen(false);
    } catch (err) {
      console.error('Failed to create room:', err);
      const serverMessage = err.response?.data?.message || err.message || 'Failed to save room. Please try again.';
      setAddRoomError(serverMessage);
    } finally {
      setIsSubmittingRoom(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await getRoomsMatrix();
      setFloors(data);
      // update selectedRoom if currently open
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Keep selectedRoom updated after refetch
  useEffect(() => {
    if (selectedRoom && floors.length > 0) {
      const updated = floors.flatMap(f => f.rooms).find(r => r.id === selectedRoom.id);
      if (updated) setSelectedRoom(updated);
    }
  }, [floors]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const visibleFloors = activeFloor === 'all' ? floors : floors.filter((f) => f.id === activeFloor);
  const allBeds = floors.flatMap((f) => f.rooms.flatMap((r) => r.beds));
  const totalBeds = allBeds.length;
  const occupiedBeds = allBeds.filter(b => b.status === 'OCCUPIED').length;
  const availableBeds = totalBeds - occupiedBeds;

  const handleEditRoomSubmit = async () => {
    try {
      await updateRoom(selectedRoom.id, editingRoomData);
      setIsEditingRoom(false);
      await fetchRooms();
      alert('Room updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating room');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignBed(selectedRoom.id, assigningBed.id, assignFormData);
      setAssigningBed(null);
      await fetchRooms();
      alert('Person assigned successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error assigning person');
    }
  };

  const handleCheckout = async (bedId) => {
    if (!window.confirm('Are you sure you want to remove/checkout this person?')) return;
    try {
      await checkoutBed(selectedRoom.id, bedId);
      await fetchRooms();
      alert('Person checked out successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error checking out person');
    }
  };

  const getRoomStatus = (room) => {
    if (room.beds.every(b => b.status === 'AVAILABLE')) return 'AVAILABLE';
    if (room.beds.every(b => b.status === 'OCCUPIED')) return 'OCCUPIED';
    return 'PARTIALLY_OCCUPIED';
  };

  if (loading && floors.length === 0) return <div className="p-8 flex items-center justify-center"><p>Loading room data...</p></div>;

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border ${
            toast.type === 'success'
              ? 'bg-primary-fixed/20 border-primary/40 text-on-surface'
              : 'bg-error-container border-error/40 text-on-error-container'
          } shadow-sm transition-all animate-fade-in`}
        >
          <div className="flex items-center gap-3">
            <Icon
              name={toast.type === 'success' ? 'check_circle' : 'error'}
              size={22}
              className={toast.type === 'success' ? 'text-primary' : 'text-error'}
            />
            <span className="font-semibold text-body-md">{toast.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
      )}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        <StatCard title="Total Beds" value={totalBeds} icon="hotel" iconBg="bg-surface-container" iconColor="text-primary" subtitle="Across all rooms" />
        <StatCard title="Occupied" value={occupiedBeds} icon="how_to_reg" iconBg="bg-primary-fixed" iconColor="text-on-primary-fixed-variant" trend="up" trendLabel={totalBeds > 0 ? `${Math.round(occupiedBeds / totalBeds * 100)}%` : '0%'} />
        <StatCard title="Available" value={availableBeds} icon="meeting_room" iconBg="bg-surface-container" iconColor="text-secondary" subtitle="Instant check-in ready" />
        <StatCard title="Notice Period" value="0" icon="schedule" iconBg="bg-secondary-fixed" iconColor="text-on-secondary-fixed" subtitle="Vacating in ≤15 days" />
      </div>

      <div className="section-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-md border-b border-surface-container">
          <div>
            <h2 className="font-headline font-semibold text-headline-md text-on-surface flex items-center gap-2">
              <Icon name="grid_4x4" size={22} className="text-primary" />
              Bed Assignment Grid
            </h2>
            <p className="text-body-sm text-on-surface-variant">Click any room card for details</p>
          </div>
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
                    onClick={() => {
                      setSelectedRoom(room);
                      setIsEditingRoom(false);
                      setEditingRoomData({ number: room.number, type: room.type, capacity: room.capacity, rent: room.rent });
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-label-md font-bold text-on-surface">Room {room.number}</span>
                      <span className="text-label-sm text-outline">{typeLabels[room.type] || room.type}</span>
                    </div>
                    <div className="space-y-1.5">
                      {room.beds.map((bed) => (
                        <div
                          key={bed.id}
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
                      <span>₹{room.rent?.toLocaleString('en-IN')}/bed</span>
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

      <Modal
        open={!!selectedRoom && !assigningBed}
        onClose={() => { setSelectedRoom(null); setIsEditingRoom(false); }}
        title={`Room ${selectedRoom?.number} Details`}
        footer={
          <>
            {isEditingRoom ? (
              <>
                <button className="btn-secondary" onClick={() => setIsEditingRoom(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleEditRoomSubmit}><Icon name="save" size={16} />Save Changes</button>
              </>
            ) : (
              <>
                <button className="btn-secondary" onClick={() => setSelectedRoom(null)}>Close</button>
                <button className="btn-primary" onClick={() => setIsEditingRoom(true)}><Icon name="edit" size={16} />Edit Room</button>
              </>
            )}
          </>
        }
      >
        {selectedRoom && (
          <div className="space-y-4">
            {isEditingRoom ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Room Number</label>
                  <input className="input" value={editingRoomData.number} onChange={e => setEditingRoomData({...editingRoomData, number: e.target.value})} required />
                </div>
                <div>
                  <label className="label">Room Type</label>
                  <select className="input" value={editingRoomData.type} onChange={e => setEditingRoomData({...editingRoomData, type: e.target.value})}>
                    <option value="SINGLE">Single</option>
                    <option value="DOUBLE">Double</option>
                    <option value="TRIPLE">Triple</option>
                    <option value="QUAD">Quad</option>
                  </select>
                </div>
                <div>
                  <label className="label">Capacity (Beds)</label>
                  <input className="input" type="number" min="1" value={editingRoomData.capacity} onChange={e => setEditingRoomData({...editingRoomData, capacity: Number(e.target.value)})} required />
                </div>
                <div>
                  <label className="label">Monthly Rent/Bed</label>
                  <input className="input" type="number" min="0" value={editingRoomData.rent} onChange={e => setEditingRoomData({...editingRoomData, rent: Number(e.target.value)})} required />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div><p className="label">Room Type</p><p className="text-body-md">{selectedRoom.type}</p></div>
                <div><p className="label">Capacity</p><p className="text-body-md">{selectedRoom.capacity} beds</p></div>
                <div><p className="label">Monthly Rent</p><p className="text-body-md font-semibold">₹{selectedRoom.rent?.toLocaleString('en-IN')}/bed</p></div>
                <div><p className="label">Status</p>
                  <StatusBadge status={getRoomStatus(selectedRoom)} />
                </div>
              </div>
            )}

            <div>
              <p className="label mb-2">Bed Occupancy / Residents</p>
              <div className="space-y-2">
                {selectedRoom.beds?.map((bed) => (
                  <div key={bed.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
                    <div className="flex flex-col">
                      <span className="font-semibold text-on-surface">Bed {bed.label}</span>
                      {bed.resident && <span className="text-body-sm text-on-surface-variant font-medium mt-1">{bed.resident}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={bed.status} />
                      {bed.status === 'AVAILABLE' ? (
                        <button className="btn-secondary text-xs px-2 py-1" onClick={() => setAssigningBed(bed)}>
                          <Icon name="person_add" size={14} /> Assign Person
                        </button>
                      ) : (
                        <div className="flex gap-2">
                           <button className="btn-secondary text-xs px-2 py-1 text-error" onClick={() => handleCheckout(bed.id)}>
                             <Icon name="logout" size={14} /> Remove/Checkout
                           </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Person / Assign Bed Modal */}
      <Modal
        open={!!assigningBed}
        onClose={() => setAssigningBed(null)}
        title={`Assign Person to Bed ${assigningBed?.label}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input required className="input" placeholder="e.g. John Doe" value={assignFormData.name} onChange={e => setAssignFormData({...assignFormData, name: e.target.value})} />
            </div>
            <div>
              <label className="label">Phone Number *</label>
              <input required className="input" placeholder="+91 9876543210" value={assignFormData.phone} onChange={e => setAssignFormData({...assignFormData, phone: e.target.value})} />
            </div>
            <div>
              <label className="label">Email *</label>
              <input required type="email" className="input" placeholder="john@example.com" value={assignFormData.email} onChange={e => setAssignFormData({...assignFormData, email: e.target.value})} />
            </div>
            <div>
              <label className="label">Check-in Date *</label>
              <input required type="date" className="input" value={assignFormData.checkInDate} onChange={e => setAssignFormData({...assignFormData, checkInDate: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Address</label>
              <input className="input" placeholder="Full permanent address" value={assignFormData.address || ''} onChange={e => setAssignFormData({...assignFormData, address: e.target.value})} />
            </div>
            <div>
              <label className="label">Monthly Rent (₹)</label>
              <input type="number" required className="input" placeholder="Leave empty for room default" value={assignFormData.monthlyRent || selectedRoom?.rent || ''} onChange={e => setAssignFormData({...assignFormData, monthlyRent: Number(e.target.value)})} />
            </div>
            <div>
              <label className="label">Student/Employee ID</label>
              <input className="input" placeholder="Optional" value={assignFormData.studentId || ''} onChange={e => setAssignFormData({...assignFormData, studentId: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <p className="label mb-2 border-b border-outline-variant/30 pb-1">Emergency Contact</p>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="label">Name</label>
                   <input className="input" placeholder="Emergency Contact Name" value={assignFormData.emergencyContact?.name || ''} onChange={e => setAssignFormData({...assignFormData, emergencyContact: {...assignFormData.emergencyContact, name: e.target.value}})} />
                 </div>
                 <div>
                   <label className="label">Phone</label>
                   <input className="input" placeholder="Emergency Contact Phone" value={assignFormData.emergencyContact?.phone || ''} onChange={e => setAssignFormData({...assignFormData, emergencyContact: {...assignFormData.emergencyContact, phone: e.target.value}})} />
                 </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/30">
            <button type="button" className="btn-secondary" onClick={() => setAssigningBed(null)}>Cancel</button>
            <button type="submit" className="btn-primary"><Icon name="save" size={16} /> Save & Assign</button>
          </div>
        </form>
      </Modal>

      {/* Add Room modal */}
      <Modal
        open={addRoomOpen}
        onClose={handleCloseAddRoomModal}
        title="Add New Room"
        size="lg"
        footer={
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCloseAddRoomModal}
              disabled={isSubmittingRoom}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleCreateRoom}
              disabled={isSubmittingRoom}
            >
              <Icon
                name={isSubmittingRoom ? "refresh" : "save"}
                size={16}
                className={isSubmittingRoom ? "animate-spin" : ""}
              />
              {isSubmittingRoom ? 'Saving...' : 'Save Room'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateRoom} className="space-y-4">
          {addRoomError && (
            <div className="p-3 rounded-lg bg-error-container/40 border border-error/40 text-error flex items-start gap-2 text-body-sm">
              <Icon name="error" size={18} className="shrink-0 mt-0.5" />
              <span>{addRoomError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Room Number */}
            <div>
              <label className="label">Room Number *</label>
              <input
                type="text"
                className={`input ${formErrors.roomNumber ? 'border-error ring-1 ring-error' : ''}`}
                placeholder="e.g. 105"
                value={newRoomData.roomNumber}
                onChange={(e) => {
                  setNewRoomData({ ...newRoomData, roomNumber: e.target.value });
                  if (formErrors.roomNumber) setFormErrors({ ...formErrors, roomNumber: null });
                }}
                disabled={isSubmittingRoom}
                required
              />
              {formErrors.roomNumber && (
                <p className="text-xs text-error mt-1">{formErrors.roomNumber}</p>
              )}
            </div>

            {/* Floor */}
            <div>
              <label className="label">Floor *</label>
              <input
                type="number"
                min="0"
                step="1"
                className={`input ${formErrors.floor ? 'border-error ring-1 ring-error' : ''}`}
                placeholder="e.g. 1 (0 for Ground Floor)"
                value={newRoomData.floor}
                onChange={(e) => {
                  setNewRoomData({ ...newRoomData, floor: e.target.value });
                  if (formErrors.floor) setFormErrors({ ...formErrors, floor: null });
                }}
                disabled={isSubmittingRoom}
                required
              />
              {formErrors.floor && (
                <p className="text-xs text-error mt-1">{formErrors.floor}</p>
              )}
            </div>

            {/* Sharing Type */}
            <div>
              <label className="label">Sharing Type *</label>
              <select
                className={`input ${formErrors.type ? 'border-error ring-1 ring-error' : ''}`}
                value={newRoomData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                disabled={isSubmittingRoom}
              >
                <option value="SINGLE">Single (1-Sharing)</option>
                <option value="DOUBLE">Double (2-Sharing)</option>
                <option value="TRIPLE">Triple (3-Sharing)</option>
                <option value="QUAD">Quad (4-Sharing)</option>
              </select>
              {formErrors.type && (
                <p className="text-xs text-error mt-1">{formErrors.type}</p>
              )}
            </div>

            {/* Number of Beds / Capacity */}
            <div>
              <label className="label">Number of Beds (Capacity) *</label>
              <input
                type="number"
                min="1"
                max="8"
                className={`input ${formErrors.capacity ? 'border-error ring-1 ring-error' : ''}`}
                value={newRoomData.capacity}
                onChange={(e) => {
                  setNewRoomData({ ...newRoomData, capacity: parseInt(e.target.value, 10) || '' });
                  if (formErrors.capacity) setFormErrors({ ...formErrors, capacity: null });
                }}
                disabled={isSubmittingRoom}
                required
              />
              {formErrors.capacity ? (
                <p className="text-xs text-error mt-1">{formErrors.capacity}</p>
              ) : (
                <p className="text-xs text-on-surface-variant mt-1">
                  Generates Beds: {Array.from({ length: Number(newRoomData.capacity) || 0 }, (_, i) => String.fromCharCode(65 + i)).join(', ') || 'None'}
                </p>
              )}
            </div>

            {/* Rent per Bed */}
            <div>
              <label className="label">Rent Per Bed (₹/month) *</label>
              <input
                type="number"
                min="0"
                step="100"
                className={`input ${formErrors.rent ? 'border-error ring-1 ring-error' : ''}`}
                placeholder="e.g. 7000"
                value={newRoomData.rent}
                onChange={(e) => {
                  setNewRoomData({ ...newRoomData, rent: e.target.value });
                  if (formErrors.rent) setFormErrors({ ...formErrors, rent: null });
                }}
                disabled={isSubmittingRoom}
                required
              />
              {formErrors.rent && (
                <p className="text-xs text-error mt-1">{formErrors.rent}</p>
              )}
            </div>

            {/* Room Status Indicator */}
            <div>
              <label className="label">Initial Room Status</label>
              <div className="h-[42px] px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant/30 flex items-center justify-between text-body-sm">
                <span className="text-on-surface font-medium">Active (All beds vacant)</span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary-fixed text-on-primary-fixed">AVAILABLE</span>
              </div>
            </div>
          </div>

          {/* Amenities checklist */}
          <div>
            <label className="label mb-1.5 block">Room Amenities</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {[
                'Wi-Fi',
                'Attached Bathroom',
                'AC',
                'Balcony',
                'Geyser',
                'Cupboard',
                'Study Table',
                'TV'
              ].map((amenity) => {
                const isChecked = newRoomData.amenities.includes(amenity);
                return (
                  <label
                    key={amenity}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-body-sm transition-colors ${
                      isChecked
                        ? 'bg-primary-fixed/20 border-primary/40 text-on-surface font-medium'
                        : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="accent-primary rounded"
                      checked={isChecked}
                      onChange={() => handleAmenityToggle(amenity)}
                      disabled={isSubmittingRoom}
                    />
                    <span className="text-xs">{amenity}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RoomsBedMatrix;
