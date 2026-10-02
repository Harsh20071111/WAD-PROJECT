import { NavLink } from 'react-router-dom';
import Icon from './Icon';

const ITEMS = {
  ADMIN: [
    ['Dashboard', 'grid_view', '/admin/dashboard'],
    ['Rooms', 'bed', '/admin/rooms'],
    ['Residents', 'badge', '/admin/residents'],
    ['Payments', 'currency_rupee', '/admin/payments'],
    ['Requests', 'build', '/admin/complaints'],
  ],
  RESIDENT: [
    ['Home', 'grid_view', '/resident/dashboard'],
    ['My Room', 'bed', '/resident/room'],
    ['Payments', 'currency_rupee', '/resident/payments'],
    ['Requests', 'build', '/resident/complaints'],
    ['Notices', 'campaign', '/resident/notices'],
  ],
  STAFF: [
    ['My Tasks', 'assignment', '/staff/tasks'],
  ],
};

const MobileNav = ({ role = 'ADMIN' }) => (
  <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface-container-lowest border-t border-outline-variant px-2 py-1.5 grid grid-cols-5 gap-1 shadow-card">
    {ITEMS[role].map(([label, icon, path]) => (
      <NavLink key={path} to={path} className={({ isActive }) => `flex flex-col items-center gap-0.5 rounded-lg py-1 text-[10px] ${isActive ? 'bg-primary text-on-primary font-semibold' : 'text-on-surface-variant'}`}>
        <Icon name={icon} size={18} />
        <span>{label}</span>
      </NavLink>
    ))}
  </nav>
);

export default MobileNav;
