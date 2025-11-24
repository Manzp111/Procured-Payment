import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  CheckBadgeIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';



interface SidebarProps {
  userRole: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar = ({ userRole, open, setOpen }: SidebarProps) => {
  const location = useLocation();
  
  // Define navigation based on user role
  const navItems = getNavItems(userRole);
  
  return (
    <div 
      className={`absolute md:relative z-20 w-64 bg-white shadow-lg transform ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}
    >
      <div className="flex flex-col h-full pt-5 pb-4">
        <nav className="mt-5 flex-1 px-2">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive 
                      ? 'bg-green-50 text-green-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

// Helper function to get navigation items based on user role
const getNavItems = (role: string) => {
  const baseItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Requests', href: '/requests', icon: DocumentTextIcon },
  ];
  
  if (role === 'staff') {
    return [
      ...baseItems,
      { name: 'My Requests', href: '/my-requests', icon: DocumentTextIcon },
      { name: 'Submit Receipt', href: '/submit-receipt', icon: CurrencyDollarIcon },
    ];
  }
  
  if (role.includes('approver')) {
    return [
      ...baseItems,
      { name: 'Pending Approvals', href: '/approvals', icon: CheckBadgeIcon },
      { name: 'Approval History', href: '/approval-history', icon: DocumentTextIcon },
    ];
  }
  
  if (role === 'finance') {
    return [
      ...baseItems,
      { name: 'Approved Requests', href: '/approved', icon: CheckBadgeIcon },
      { name: 'Receipt Validation', href: '/receipts', icon: CurrencyDollarIcon },
      { name: 'Discrepancies', href: '/discrepancies', icon: DocumentTextIcon },
    ];
  }
  
  // Admin gets all
  return [
    ...baseItems,
    { name: 'All Requests', href: '/all-requests', icon: DocumentTextIcon },
    { name: 'Approvals', href: '/approvals', icon: CheckBadgeIcon },
    { name: 'Finance', href: '/finance', icon: CurrencyDollarIcon },
    { name: 'Users', href: '/users', icon: UserGroupIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ];
};

export default Sidebar;