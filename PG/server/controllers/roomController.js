const asyncHandler = require('express-async-handler');
const Room = require('../models/Room');
const Bed = require('../models/Bed');
const Resident = require('../models/Resident');
const User = require('../models/User');
const PG = require('../models/PG');

// @desc    Get rooms grouped by floor (matrix format)
// @route   GET /api/rooms
// @access  Private (Admin)
const getRooms = asyncHandler(async (req, res) => {
  const pgId = req.user.pgId;
  const rooms = await Room.find({ pgId }).sort({ floor: 1, roomNumber: 1 });
  const beds = await Bed.find({ pgId }).populate({
    path: 'residentId',
    populate: { path: 'userId', select: 'name email phone' }
  }).sort({ label: 1 });

  // Group by floor
  const floorsMap = {};

  for (const room of rooms) {
    if (!floorsMap[room.floor]) {
      floorsMap[room.floor] = { id: `f${room.floor}`, label: `Floor ${room.floor}`, rooms: [] };
    }
    
    const roomBeds = beds.filter(b => b.roomId.toString() === room._id.toString());
    
    floorsMap[room.floor].rooms.push({
      id: room._id,
      number: room.roomNumber,
      type: room.type,
      capacity: room.capacity,
      rent: room.rent,
      beds: roomBeds.map(b => ({
        id: b._id,
        label: b.label,
        status: b.status,
        resident: b.residentId?.userId?.name || null,
        residentDetails: b.residentId || null
      }))
    });
  }

  const floors = Object.values(floorsMap).sort((a, b) => parseInt(a.id.replace('f', '')) - parseInt(b.id.replace('f', '')));
  res.json({ success: true, data: floors });
});

// @desc    Update room details
// @route   PUT /api/rooms/:id
// @access  Private (Admin)
const updateRoom = asyncHandler(async (req, res) => {
  const { number, type, capacity, rent } = req.body;
  const room = await Room.findById(req.params.id);

  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  if (room.pgId.toString() !== req.user.pgId.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this room');
  }

  room.roomNumber = number || room.roomNumber;
  room.type = type || room.type;
  room.rent = rent !== undefined ? rent : room.rent;

  // Capacity changes
  if (capacity !== undefined && capacity !== room.capacity) {
    if (capacity < room.capacity) {
      // Check if beds being removed are occupied
      const beds = await Bed.find({ roomId: room._id }).sort({ label: -1 }); // get last beds
      let removedCount = 0;
      for (let i = 0; i < room.capacity - capacity; i++) {
        if (beds[i] && beds[i].status === 'OCCUPIED') {
          res.status(400);
          throw new Error(`Cannot reduce capacity. Bed ${beds[i].label} is currently occupied.`);
        }
      }
      // Remove extra beds
      for (let i = 0; i < room.capacity - capacity; i++) {
        if (beds[i]) await Bed.findByIdAndDelete(beds[i]._id);
      }
    } else {
      // Add new beds
      const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const currentBedsCount = room.capacity;
      for (let i = currentBedsCount; i < capacity; i++) {
        await Bed.create({
          pgId: room.pgId,
          roomId: room._id,
          label: labels[i] || `Bed ${i+1}`,
          status: 'AVAILABLE'
        });
      }
    }
    room.capacity = capacity;
  }

  await room.save();
  res.json({ success: true, data: room });
});

// @desc    Assign a person to a bed
// @route   POST /api/rooms/:roomId/beds/:bedId/assign
// @access  Private (Admin)
const assignBed = asyncHandler(async (req, res) => {
  const { name, email, phone, checkInDate, address, emergencyContact, monthlyRent } = req.body;
  
  const bed = await Bed.findById(req.params.bedId);
  if (!bed) {
    res.status(404);
    throw new Error('Bed not found');
  }
  if (bed.status === 'OCCUPIED') {
    res.status(400);
    throw new Error('Bed is already occupied');
  }
  
  const room = await Room.findById(bed.roomId);

  // 1. Create User
  const user = await User.create({
    name, email, phone,
    passwordHash: 'Resident@1234', // default password
    role: 'RESIDENT',
    pgId: req.user.pgId,
    isActive: true
  });

  // 2. Create Resident
  const resident = await Resident.create({
    userId: user._id,
    pgId: req.user.pgId,
    roomId: bed.roomId,
    bedId: bed._id,
    joiningDate: checkInDate || new Date(),
    address: address || '',
    emergencyContact: emergencyContact || { name: '', relation: '', phone: '' },
    monthlyRent: monthlyRent || room.rent,
    status: 'ACTIVE'
  });

  // 3. Update Bed
  bed.status = 'OCCUPIED';
  bed.residentId = resident._id;
  await bed.save();

  res.status(201).json({ success: true, message: 'Person assigned successfully', data: resident });
});

// @desc    Checkout a person from a bed
// @route   POST /api/rooms/:roomId/beds/:bedId/checkout
// @access  Private (Admin)
const checkoutBed = asyncHandler(async (req, res) => {
  const bed = await Bed.findById(req.params.bedId).populate('residentId');
  if (!bed || !bed.residentId) {
    res.status(404);
    throw new Error('Bed or resident not found');
  }

  // Deactivate Resident and User
  const resident = await Resident.findById(bed.residentId._id);
  resident.isActive = false;
  resident.checkOutDate = new Date();
  await resident.save();

  await User.findByIdAndUpdate(resident.userId, { isActive: false });

  // Free up Bed
  bed.status = 'AVAILABLE';
  bed.residentId = null;
  await bed.save();

  res.json({ success: true, message: 'Person checked out successfully' });
});

// @desc    Create a new room and generate its beds
// @route   POST /api/rooms
// @access  Private (Admin)
const createRoom = asyncHandler(async (req, res) => {
  let pgId = req.user?.pgId;
  if (!pgId) {
    const defaultPg = await PG.findOne();
    if (defaultPg) {
      pgId = defaultPg._id;
    } else {
      res.status(400);
      throw new Error('No PG property associated with user');
    }
  }

  const { floor, roomNumber, type, capacity, rent, amenities = [] } = req.body;

  // Validation
  if (floor === undefined || floor === null || floor === '' || isNaN(Number(floor)) || Number(floor) < 0) {
    res.status(400);
    throw new Error('Valid floor number is required (0 or greater)');
  }

  if (!roomNumber || !roomNumber.toString().trim()) {
    res.status(400);
    throw new Error('Room number is required');
  }

  const trimmedRoomNumber = roomNumber.toString().trim();

  const validTypes = ['SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD'];
  const upperType = type ? type.toString().toUpperCase() : '';
  if (!validTypes.includes(upperType)) {
    res.status(400);
    throw new Error('Room type must be SINGLE, DOUBLE, TRIPLE, or QUAD');
  }

  const numCapacity = parseInt(capacity, 10);
  if (!numCapacity || isNaN(numCapacity) || numCapacity < 1) {
    res.status(400);
    throw new Error('Capacity must be at least 1 bed');
  }

  const numRent = Number(rent);
  if (rent === undefined || rent === null || rent === '' || isNaN(numRent) || numRent < 0) {
    res.status(400);
    throw new Error('Valid rent per bed is required (0 or greater)');
  }

  // Check uniqueness within the PG
  const existingRoom = await Room.findOne({
    pgId,
    roomNumber: trimmedRoomNumber
  });

  if (existingRoom) {
    res.status(400);
    throw new Error(`Room number "${trimmedRoomNumber}" already exists on Floor ${existingRoom.floor}`);
  }

  // Clean amenities
  const sanitizedAmenities = Array.isArray(amenities)
    ? amenities.map(a => a.toString().trim()).filter(Boolean)
    : [];

  // Create room
  const room = await Room.create({
    pgId,
    floor: Number(floor),
    roomNumber: trimmedRoomNumber,
    type: upperType,
    capacity: numCapacity,
    rent: numRent,
    amenities: sanitizedAmenities,
    isActive: true
  });

  // Create beds
  let beds = [];
  try {
    const bedDocs = Array.from({ length: numCapacity }, (_, index) => ({
      pgId,
      roomId: room._id,
      label: index < 26 ? String.fromCharCode(65 + index) : `Bed ${index + 1}`,
      status: 'AVAILABLE',
      residentId: null
    }));
    beds = await Bed.insertMany(bedDocs);
  } catch (bedErr) {
    await Room.findByIdAndDelete(room._id).catch(() => {});
    throw bedErr;
  }

  res.status(201).json({
    success: true,
    message: `Room ${room.roomNumber} created successfully`,
    data: {
      ...room.toObject(),
      beds
    }
  });
});

module.exports = { getRooms, updateRoom, assignBed, checkoutBed, createRoom };
