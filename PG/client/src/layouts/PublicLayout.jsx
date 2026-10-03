import { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import Icon from '../components/Icon';

const PublicLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => { setIsMenuOpen(false); }, [location.pathname]);

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
            }>Find PGs</NavLink>
            <NavLink to="/contact" className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-body-md transition-colors ${isActive ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`
            }>Contact</NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden text-label-md text-on-surface-variant hover:text-primary sm:inline">Login</Link>
            <Link to="/rooms" className="hidden sm:flex btn-primary min-h-10 text-sm"><Icon name="search" size={16} />Explore PGs</Link>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 -mr-2 text-on-surface-variant hover:text-on-surface"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Icon name={isMenuOpen ? "close" : "menu"} size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-outline-variant bg-surface-container-lowest absolute top-16 inset-x-0 shadow-lg">
            <nav className="flex flex-col py-2 px-4 gap-1">
              <NavLink to="/" end className={({ isActive }) => `px-4 py-3 rounded-lg text-body-lg ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface'}`}>Home</NavLink>
              <NavLink to="/rooms" className={({ isActive }) => `px-4 py-3 rounded-lg text-body-lg ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface'}`}>Find PGs</NavLink>
              <NavLink to="/contact" className={({ isActive }) => `px-4 py-3 rounded-lg text-body-lg ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface'}`}>Contact</NavLink>
              <div className="h-px bg-outline-variant my-2" />
              <Link to="/login" className="px-4 py-3 rounded-lg text-body-lg text-on-surface font-semibold flex items-center gap-2">
                <Icon name="login" size={20} />
                Login to Portal
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 relative">
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
