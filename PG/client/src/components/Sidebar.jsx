import { NavLink, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { useAuth } from '../context/AuthContext';

const NAV_ADMIN = [
  { section: 'Overview', items: [
    { label: 'Dashboard', icon: 'grid_view', path: '/admin/dashboard' },
  ]},
  { section: 'Residents & Rooms', items: [
    { label: 'Rooms & Bed Grid', icon: 'bed', path: '/admin/rooms' },
    { label: 'Residents Directory', icon: 'badge', path: '/admin/residents' },
  ]},
  { section: 'Money & Finance', items: [
    { label: 'Rent & Payments', icon: 'currency_rupee', path: '/admin/payments' },
    { label: 'Payment Receipts', icon: 'receipt_long', path: '/admin/receipts' },
  ]},
  { section: 'Service & Maintenance', items: [
    { label: 'Complaints & Requests', icon: 'build', path: '/admin/complaints' },
    { label: 'Assigned Staff', icon: 'engineering', path: '/admin/staff' },
  ]},
  { section: 'Communications', items: [
    { label: 'Notice Board', icon: 'campaign', path: '/admin/notices' },
    { label: 'Resident Feedback', icon: 'reviews', path: '/admin/feedback' },
    { label: 'Enquiries & Leads', icon: 'contact_phone', path: '/admin/enquiries' },
  ]},
];

const NAV_RESIDENT = [
  { section: 'My Home', items: [
    { label: 'Dashboard', icon: 'grid_view', path: '/resident/dashboard' },
    { label: 'My Room', icon: 'bed', path: '/resident/room' },
  ]},
  { section: 'Finance', items: [
    { label: 'My Payments', icon: 'currency_rupee', path: '/resident/payments' },
  ]},
  { section: 'Support', items: [
    { label: 'Service Requests', icon: 'build', path: '/resident/complaints' },
    { label: 'Notices', icon: 'campaign', path: '/resident/notices' },
  ]},
];

const NAV_STAFF = [
  { section: 'Work', items: [
    { label: 'My Tasks', icon: 'assignment', path: '/staff/tasks' },
  ]},
];

const Sidebar = ({ role = 'ADMIN' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navGroups = role === 'ADMIN' ? NAV_ADMIN : role === 'RESIDENT' ? NAV_RESIDENT : NAV_STAFF;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-60 bg-surface-container-lowest border-r border-outline-variant z-50 flex-col justify-between select-none">
      <div className="flex flex-col min-h-0">
        {/* Logo */}
        <div className="h-16 px-space-md border-b border-outline-variant flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm">
              <Icon name="apartment" size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-headline text-[16px] font-bold text-primary tracking-tight leading-tight">
                NestOps
              </span>
              <span className="text-label-sm text-on-surface-variant">NiwasPG ERP v2.4</span>
            </div>
          </div>
          <span className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface-variant text-label-sm font-semibold uppercase tracking-wider">
            {role === 'ADMIN' ? 'HQ' : role === 'RESIDENT' ? 'RES' : 'STF'}
          </span>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-space-sm py-space-md space-y-space-lg">
          {navGroups.map((group) => (
            <nav key={group.section} className="space-y-space-xs">
              <div className="px-space-sm pb-1 text-label-sm font-semibold uppercase tracking-wider text-outline">
                {group.section}
              </div>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon name={item.icon} size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-space-md border-t border-outline-variant bg-surface-container-low/40 space-y-space-sm">
        <div className="flex items-center justify-between text-label-sm">
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Sync: Cloud Active</span>
          </div>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-lowest border border-outline-variant">
          <div className="flex flex-col">
            <span className="text-label-md text-on-surface font-semibold truncate max-w-[120px]">
              System Mode
            </span>
            <span className="text-label-sm text-on-surface-variant">Full Permission</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-[10px] font-bold uppercase tracking-wider">{role}</span>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors"
            title="Logout"
          >
            <Icon name="logout" size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
