import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import MobileNav from '../components/MobileNav';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar role="ADMIN" />
      <div className="md:pl-60">
        <TopBar breadcrumb={['NestOps', 'Operations']} />
        <main className="pt-16 min-h-screen">
          <div className="px-space-lg py-space-lg">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav role="ADMIN" />
    </div>
  );
};

export default AdminLayout;
