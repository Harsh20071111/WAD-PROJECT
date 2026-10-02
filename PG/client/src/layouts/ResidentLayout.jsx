import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import MobileNav from '../components/MobileNav';

const ResidentLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar role="RESIDENT" />
      <div className="md:pl-60">
        <TopBar breadcrumb={['NestOps', 'Resident Portal']} />
        <main className="pt-16 min-h-screen">
          <div className="px-space-lg py-space-lg">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav role="RESIDENT" />
    </div>
  );
};

export default ResidentLayout;
