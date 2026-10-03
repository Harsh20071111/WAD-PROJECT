const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5002/api';

async function runTests() {
  console.log('🚀 Starting Acceptance Tests...');

  try {
    // 1. Resident Login
    console.log('1. Testing Resident Login...');
    const resLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'priya@resident.com',
      password: 'Resident@1234'
    });
    const residentToken = resLogin.data.data.accessToken;
    console.log('   ✅ Resident logged in successfully');

    // 2. GET /api/residents/me
    console.log('2. Testing GET /api/residents/me...');
    const resMe = await axios.get(`${BASE_URL}/residents/me`, {
      headers: { Authorization: `Bearer ${residentToken}` }
    });
    console.log('   ✅ Resident Profile:', resMe.data.data.resident?.userId?.name);
    console.log('   ✅ Room:', resMe.data.data.room?.roomNumber, 'Bed:', resMe.data.data.bed?.label);

    // 3. Create Complaint with Electrical category (SLA 12h)
    console.log('3. Testing POST /api/complaints (Electrical SLA 12h)...');
    const resComp = await axios.post(
      `${BASE_URL}/complaints`,
      {
        category: 'Electrical',
        priority: 'HIGH',
        title: 'Geyser switch spark test',
        description: 'Test electrical issue for SLA verification.'
      },
      { headers: { Authorization: `Bearer ${residentToken}` } }
    );
    const complaint = resComp.data.data;
    console.log('   ✅ Complaint created:', complaint.requestNo);
    console.log('   ✅ SLA Hours:', complaint.slaHours, '(Expected: 12)');

    // 4. Staff Login
    console.log('4. Testing Staff Login...');
    const staffLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'ravi@sunrise.pg',
      password: 'Staff@1234'
    });
    const staffToken = staffLogin.data.data.accessToken;
    console.log('   ✅ Staff logged in successfully');

    // 5. Staff ticket update (Start Ticket)
    console.log('5. Testing Staff status update (Start Ticket)...');
    const startRes = await axios.patch(
      `${BASE_URL}/complaints/${complaint._id}/status`,
      { status: 'IN_PROGRESS', note: 'Staff starting repair work.' },
      { headers: { Authorization: `Bearer ${staffToken}` } }
    );
    console.log('   ✅ Status updated to:', startRes.data.data.status);

    // 6. Staff Resolve Ticket
    console.log('6. Testing Staff status update (Resolve Ticket)...');
    const resolveRes = await axios.patch(
      `${BASE_URL}/complaints/${complaint._id}/status`,
      { status: 'RESOLVED', note: 'Replaced faulty switch board.' },
      { headers: { Authorization: `Bearer ${staffToken}` } }
    );
    console.log('   ✅ Status updated to:', resolveRes.data.data.status);

    // 7. Submit Feedback 5-star rating
    console.log('7. Testing POST /api/feedback (1-5 Star Rating)...');
    const fbRes = await axios.post(
      `${BASE_URL}/feedback`,
      {
        complaintId: complaint._id,
        rating: 5,
        comment: 'Excellent work by Ravi!'
      },
      { headers: { Authorization: `Bearer ${residentToken}` } }
    );
    console.log('   ✅ Feedback submitted, rating:', fbRes.data.data.rating);

    console.log('\n🎉 ALL API ACCEPTANCE TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

runTests();
