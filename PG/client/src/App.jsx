import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import PublicLayout    from './layouts/PublicLayout';
import AdminLayout     from './layouts/AdminLayout';
import ResidentLayout  from './layouts/ResidentLayout';

// Public pages
import Home    from './pages/public/Home';
import Rooms   from './pages/public/Rooms';
import Contact from './pages/public/Contact';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DesignPreview from './pages/DesignPreview';

// Admin pages
import AdminDashboard     from './pages/admin/Dashboard';
import RoomsBedMatrix     from './pages/admin/RoomsBedMatrix';
import ResidentsDirectory from './pages/admin/ResidentsDirectory';
import Payments           from './pages/admin/Payments';
import Receipts           from './pages/admin/Receipts';
import Complaints         from './pages/admin/Complaints';
import Staff              from './pages/admin/Staff';
import Notices            from './pages/admin/Notices';
import Feedback           from './pages/admin/Feedback';
import Enquiries          from './pages/admin/Enquiries';

// Resident pages
import ResidentDashboard  from './pages/resident/Dashboard';
import MyRoom             from './pages/resident/MyRoom';
import ResidentPayments   from './pages/resident/ResidentPayments';
import ResidentComplaints from './pages/resident/ResidentComplaints';
import ResidentNotices    from './pages/resident/ResidentNotices';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/"        element={<Home />} />
            <Route path="/rooms"   element={<Rooms />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/design-preview" element={<DesignPreview />} />

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard"  element={<AdminDashboard />} />
              <Route path="/admin/rooms"      element={<RoomsBedMatrix />} />
              <Route path="/admin/residents"  element={<ResidentsDirectory />} />
              <Route path="/admin/payments"   element={<Payments />} />
              <Route path="/admin/receipts"   element={<Receipts />} />
              <Route path="/admin/complaints" element={<Complaints />} />
              <Route path="/admin/staff"      element={<Staff />} />
              <Route path="/admin/notices"    element={<Notices />} />
              <Route path="/admin/feedback"   element={<Feedback />} />
              <Route path="/admin/enquiries"  element={<Enquiries />} />
            </Route>
          </Route>

          {/* Resident routes */}
          <Route element={<ProtectedRoute allowedRoles={['RESIDENT']} />}>
            <Route element={<ResidentLayout />}>
              <Route path="/resident/dashboard"  element={<ResidentDashboard />} />
              <Route path="/resident/room"       element={<MyRoom />} />
              <Route path="/resident/payments"   element={<ResidentPayments />} />
              <Route path="/resident/complaints" element={<ResidentComplaints />} />
              <Route path="/resident/notices"    element={<ResidentNotices />} />
            </Route>
          </Route>

          {/* Redirects */}
          <Route path="/admin"    element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/resident" element={<Navigate to="/resident/dashboard" replace />} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
