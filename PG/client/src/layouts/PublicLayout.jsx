import { Outlet, Link, NavLink } from 'react-router-dom';
import Icon from '../components/Icon';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Public Navbar */}
      <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-space-lg h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
              <Icon name="apartment" size={18} />
            </div>
              <span className="font-headline font-bold text-[18px] text-primary">NestOps</span>
          </Link>

          <nav className="hidden md:flex items-center gap-space-sm">
            <NavLink to="/" end className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-body-md transition-colors ${isActive ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`
            }>Home</NavLink>
            <NavLink to="/rooms" className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-body-md transition-colors ${isActive ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`
            }>Rooms</NavLink>
            <NavLink to="/contact" className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-body-md transition-colors ${isActive ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`
            }>Contact</NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden text-label-md text-on-surface-variant hover:text-primary sm:inline">Login</Link>
            <Link to="/rooms" className="btn-primary min-h-10 text-sm"><Icon name="bed" size={16} />Check Available Rooms</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-surface-container-lowest border-t border-outline-variant py-space-lg px-space-lg">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-space-sm text-body-sm text-on-surface-variant">
          <span>© 2026 Greenwood Luxury PG. All rights reserved.</span>
          <span>Powered by NestOps PG Management</span>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
