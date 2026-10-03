import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { useAuth } from '../context/AuthContext';
import { usePushNotifications } from '../hooks/usePushNotifications';

const TopBar = ({ title, breadcrumb }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { status, enable } = usePushNotifications();
  const isResident = user?.role === 'RESIDENT';

  const triggerInstall = () => {
    window.dispatchEvent(new Event('show-pwa-install'));
    setShowProfileMenu(false);
  };

  return (
    <header className="fixed top-0 left-0 md:left-60 right-0 h-16 bg-surface-container-lowest/95 border-b border-outline-variant z-40 px-space-lg flex items-center justify-between gap-space-md">
      {/* Left: breadcrumb / title */}
      <div className="flex items-center gap-space-md flex-1 max-w-2xl">
        {breadcrumb && (
          <div className="flex items-center gap-1.5 text-label-md text-on-surface-variant shrink-0">
            <Icon name="domain" size={18} className="text-outline" />
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-outline-variant">/</span>}
                <span className={i === breadcrumb.length - 1 ? 'text-on-surface font-semibold' : ''}>
                  {crumb}
                </span>
              </span>
            ))}
          </div>
        )}
        {!isResident && (
          <div className="relative flex-1 hidden sm:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <Icon name="search" size={18} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bed no, resident phone, Aadhaar, room token..."
              className="w-full pl-9 pr-3 py-1.5 bg-background border border-outline-variant rounded-lg text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        )}
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-space-md">
        {/* PG Name (Admin / Staff only) */}
        {!isResident && (
          <>
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest">
              <Icon name="location_on" size={18} className="text-primary" />
              <div className="flex flex-col text-left">
                <span className="text-label-md text-on-surface leading-tight">Greenwood Luxury PG</span>
                <span className="text-label-sm text-on-surface-variant leading-none">Navrangpura, Ahmedabad</span>
              </div>
            </div>
            <div className="h-6 w-px bg-outline-variant" />
          </>
        )}

        {/* Enable Push Notifications Prompt */}
        {status === 'default' && (
          <button
            onClick={enable}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-label-sm font-medium border border-primary/20"
            title="Enable Push Notifications"
          >
            <Icon name="notifications_active" size={16} />
            <span>Enable Push</span>
          </button>
        )}

        {/* Notifications */}
        <button 
          onClick={() => navigate(isResident ? '/resident/notices' : '/admin/complaints')}
          className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors" title="Notifications">
          <Icon name="notifications" size={20} />
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-space-sm pl-1 hover:bg-surface-container-low rounded-lg p-1 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-label-md font-bold">
              <Icon name="person" size={18} />
            </div>
            <div className="hidden xl:flex flex-col text-left mr-1">
              <span className="text-label-md text-on-surface leading-tight font-medium">{user?.name || (isResident ? 'Priya Sharma' : 'PG Owner')}</span>
              <span className="text-label-sm text-on-surface-variant leading-none">{isResident ? 'Resident' : (user?.role || 'Admin')}</span>
            </div>
            <Icon name="expand_more" size={18} className="text-outline hidden xl:block" />
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in py-1">
                <button 
                  onClick={triggerInstall}
                  className="w-full text-left px-4 py-2.5 text-body-sm text-on-surface hover:bg-surface-container-low flex items-center gap-2 transition-colors"
                >
                  <Icon name="get_app" size={18} className="text-primary" />
                  Install App
                </button>
                <div className="h-px bg-outline-variant my-1" />
                <button 
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-2.5 text-body-sm text-error hover:bg-error-container hover:text-on-error-container flex items-center gap-2 transition-colors"
                >
                  <Icon name="logout" size={18} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
