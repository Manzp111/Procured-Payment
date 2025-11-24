import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import type { User } from '../../types';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  user: User;
}

const DashboardLayout = ({ user }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        userRole={user.role} 
        open={sidebarOpen} 
        setOpen={setSidebarOpen} 
      />
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          user={user} 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;