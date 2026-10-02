require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const PG = require('../models/PG');
const Room = require('../models/Room');
const Bed = require('../models/Bed');
const Resident = require('../models/Resident');
const Staff = require('../models/Staff');
const Payment = require('../models/Payment');
const PaymentReceipt = require('../models/PaymentReceipt');
const Category = require('../models/Category');
const Notice = require('../models/Notice');
const Enquiry = require('../models/Enquiry');
const Complaint = require('../models/Complaint');
const ComplaintUpdate = require('../models/ComplaintUpdate');
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');
const Counter = require('../models/Counter');

const CATEGORIES = ['Electrical', 'Plumbing', 'Cleaning', 'Furniture', 'Wi-Fi', 'AC', 'Fan', 'Water', 'Room Maintenance', 'Bathroom', 'Security', 'Carpentry', 'Pest Control', 'Common Area', 'Other'];
const ROOM_CONFIG = [
  { floor: 1, roomNumber: '101', type: 'SINGLE', capacity: 1, rent: 8000 },
  { floor: 1, roomNumber: '102', type: 'DOUBLE', capacity: 2, rent: 6500 },
  { floor: 1, roomNumber: '103', type: 'TRIPLE', capacity: 3, rent: 5500 },
  { floor: 1, roomNumber: '104', type: 'SINGLE', capacity: 1, rent: 8000 },
  { floor: 2, roomNumber: '201', type: 'SINGLE', capacity: 1, rent: 8500 },
  { floor: 2, roomNumber: '202', type: 'DOUBLE', capacity: 2, rent: 7000 },
  { floor: 2, roomNumber: '203', type: 'TRIPLE', capacity: 3, rent: 6000 }
];
const PASSWORDS = { admin: 'Admin@1234', staff: 'Staff@1234', resident: 'Resident@1234' };
const dateAt = (offsetDays) => new Date(Date.now() + offsetDays * 86400000);
const monthAt = (offset) => { const date = new Date(); date.setMonth(date.getMonth() + offset); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; };

async function clearDatabase() {
  const models = [Counter, Notice, Enquiry, PaymentReceipt, Payment, Feedback, ComplaintUpdate, Complaint, Notification, Staff, Resident, Bed, Room, Category, PG, User];
  await Promise.all(models.map((model) => model.deleteMany({})));
}
async function createUser(data, password) { return User.create({ ...data, passwordHash: password, isActive: true }); }

async function seed() {
  const admin = await createUser({ name: 'PG Admin', email: 'admin@pgmanage.com', phone: '+91 9800000001', role: 'ADMIN' }, PASSWORDS.admin);
  const pg = await PG.create({ name: 'Sunrise PG', address: { street: '12 MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001' }, contact: { phone: '+91 8000000001', email: 'admin@pgmanage.com' }, amenities: ['Wi-Fi', 'Power Backup', 'CCTV', 'Hot Water', 'Laundry', 'Parking'], ownerId: admin._id });
  admin.pgId = pg._id; await admin.save();

  const rooms = []; const beds = [];
  for (const config of ROOM_CONFIG) {
    const room = await Room.create({ pgId: pg._id, ...config, amenities: ['Wi-Fi', 'Attached Bathroom'] }); rooms.push(room);
    for (let index = 0; index < config.capacity; index += 1) beds.push(await Bed.create({ pgId: pg._id, roomId: room._id, label: String.fromCharCode(65 + index), status: 'AVAILABLE' }));
  }
  await Category.insertMany(CATEGORIES.map((name) => ({ pgId: pg._id, name, isDefault: true })));
  const staffUsers = await Promise.all([
    createUser({ name: 'Ravi Kumar', email: 'ravi@sunrise.pg', phone: '+91 9100000001', role: 'STAFF', pgId: pg._id }, PASSWORDS.staff),
    createUser({ name: 'Suresh Nair', email: 'suresh@sunrise.pg', phone: '+91 9100000002', role: 'STAFF', pgId: pg._id }, PASSWORDS.staff)
  ]);
  await Staff.insertMany(staffUsers.map((user, index) => ({ userId: user._id, pgId: pg._id, categories: index ? ['Cleaning', 'Furniture', 'Wi-Fi'] : ['Electrical', 'Plumbing', 'AC'] })));

  const residentData = [['Priya Sharma', 'priya@resident.com', 'FEMALE'], ['Arjun Mehta', 'arjun@resident.com', 'MALE'], ['Aarav Shah', 'aarav@resident.com', 'MALE'], ['Meera Joshi', 'meera@resident.com', 'FEMALE'], ['Kabir Singh', 'kabir@resident.com', 'MALE'], ['Isha Patel', 'isha@resident.com', 'FEMALE'], ['Rohan Das', 'rohan@resident.com', 'MALE'], ['Nisha Rao', 'nisha@resident.com', 'FEMALE']];
  const residentUsers = await Promise.all(residentData.map(([name, email], index) => createUser({ name, email, phone: `+91 92000000${String(index + 1).padStart(2, '0')}`, role: 'RESIDENT', pgId: pg._id }, PASSWORDS.resident)));
  const assignmentBeds = beds.slice(0, residentUsers.length - 1); const residents = [];
  for (let index = 0; index < residentUsers.length; index += 1) {
    const bed = assignmentBeds[index]; const room = bed ? rooms.find((item) => String(item._id) === String(bed.roomId)) : null;
    residents.push(await Resident.create({ userId: residentUsers[index]._id, pgId: pg._id, gender: residentData[index][2], address: 'Demo resident address', joiningDate: new Date('2025-01-01'), roomId: room?._id || null, bedId: bed?._id || null, monthlyRent: room?.rent || 5500, securityDeposit: (room?.rent || 5500) * 2, status: 'ACTIVE' }));
    if (bed) { bed.residentId = residents[index]._id; bed.status = index === 1 ? 'UNDER_NOTICE' : 'OCCUPIED'; bed.statusNote = index === 1 ? 'Move-out notice submitted' : ''; await bed.save(); }
  }
  const blockedBed = beds[beds.length - 1]; blockedBed.status = 'BLOCKED'; blockedBed.statusNote = 'Reserved for maintenance demo'; await blockedBed.save();
  const maintenanceBed = beds[beds.length - 2]; maintenanceBed.status = 'MAINTENANCE'; maintenanceBed.statusNote = 'Fan replacement'; await maintenanceBed.save();

  const payments = await Payment.insertMany([
    { pgId: pg._id, residentId: residents[0]._id, month: monthAt(-2), amount: 5500, dueDate: dateAt(-60), gracePeriodUntil: dateAt(-45), status: 'OVERDUE' },
    { pgId: pg._id, residentId: residents[1]._id, month: monthAt(-1), amount: 6000, dueDate: dateAt(-30), gracePeriodUntil: dateAt(-15), status: 'OVERDUE' },
    { pgId: pg._id, residentId: residents[2]._id, month: monthAt(-1), amount: 6500, dueDate: dateAt(-25), gracePeriodUntil: dateAt(2), status: 'OVERDUE' },
    { pgId: pg._id, residentId: residents[0]._id, month: monthAt(0), amount: 5500, paidAmount: 5500, dueDate: dateAt(5), status: 'PAID', method: 'UPI', paidAt: dateAt(-2), transactionId: 'demo_txn_001' },
    { pgId: pg._id, residentId: residents[3]._id, month: monthAt(0), amount: 5500, dueDate: dateAt(5), status: 'PENDING' }
  ]);
  const paid = payments[3];
  await PaymentReceipt.create({ paymentId: paid._id, receiptNumber: 'RCP-DEMO-001', residentSnapshot: { name: residentData[0][0], email: residentData[0][1], phone: residentUsers[0].phone }, pgSnapshot: { name: pg.name, address: `${pg.address.street}, ${pg.address.city}` }, month: paid.month, amount: paid.amount, paidAt: paid.paidAt, transactionId: paid.transactionId });
  await Notice.insertMany([
    { pgId: pg._id, title: 'Urgent water maintenance', body: 'Water supply will pause for two hours today.', createdBy: admin._id, isPinned: true, isUrgent: true, audience: { type: 'ALL' } },
    { pgId: pg._id, title: 'Monthly rent reminder', body: 'Please clear dues before the fifth.', createdBy: admin._id, isPinned: true, audience: { type: 'RESIDENTS' } },
    { pgId: pg._id, title: 'Floor 2 inspection', body: 'Inspection is scheduled for tomorrow.', createdBy: admin._id, audience: { type: 'FLOOR', floor: 2 }, scheduledFor: dateAt(-1) }
  ]);
  await Enquiry.insertMany([
    { pgId: pg._id, name: 'Vikram Singh', phone: '+91 9400000001', email: 'vikram@email.com', message: 'Looking for a single room.', source: 'WEBSITE' },
    { pgId: pg._id, name: 'Neha Gupta', phone: '+91 9400000002', email: 'neha@email.com', message: 'Interested in triple sharing.', source: 'REFERRAL' },
    { pgId: pg._id, name: 'Dev Malhotra', phone: '+91 9400000003', email: 'dev@email.com', message: 'Asking about move-in dates.', source: 'PHONE', status: 'CONTACTED', followUpAt: dateAt(2) }
  ]);
  const staff = await Staff.findOne({ pgId: pg._id });
  const activeComplaint = await Complaint.create({ pgId: pg._id, requestNo: 'REQ-DEMO-001', residentId: residents[0]._id, roomId: residents[0].roomId, category: 'Plumbing', priority: 'HIGH', title: 'Bathroom leak', description: 'Water is leaking near the basin.', attachments: [{ url: 'https://placehold.co/800x600?text=demo-photo', publicId: 'demo-photo-placeholder' }], status: 'IN_PROGRESS', assignedStaffId: staff._id, slaDueAt: dateAt(1) });
  const resolvedComplaint = await Complaint.create({ pgId: pg._id, requestNo: 'REQ-DEMO-002', residentId: residents[1]._id, roomId: residents[1].roomId, category: 'Electrical', priority: 'MEDIUM', title: 'Light replacement', description: 'Ceiling light was replaced.', attachments: [], status: 'RESOLVED', assignedStaffId: staff._id, slaDueAt: dateAt(-4), resolvedAt: dateAt(-1), requiresFeedback: true });
  await ComplaintUpdate.insertMany([{ complaintId: activeComplaint._id, fromStatus: 'NEW', toStatus: 'IN_PROGRESS', note: 'Assigned for demo', actorId: admin._id }, { complaintId: resolvedComplaint._id, fromStatus: 'IN_PROGRESS', toStatus: 'RESOLVED', note: 'Work completed', actorId: admin._id }]);
  return { rooms: rooms.length, beds: beds.length, residents: residents.length, payments: payments.length, complaints: 2 };
}

(async () => {
  try { await mongoose.connect(process.env.MONGO_URI); await clearDatabase(); const counts = await seed(); console.log(`Demo seed complete: ${counts.rooms} rooms, ${counts.beds} beds, ${counts.residents} residents, ${counts.payments} payments, ${counts.complaints} complaints.`); }
  catch (error) { console.error('Seed failed:', error.message); process.exitCode = 1; }
  finally { await mongoose.connection.close(); }
})();
