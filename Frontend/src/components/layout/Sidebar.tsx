import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  Home, Plus, FileText, Clock, CheckCircle, Receipt, DollarSign, 
  AlertTriangle, BarChart, User 
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SidebarItemData {
  icon: LucideIcon; 
  label: string;
  path: string;
  description?: string;
  badge?: number;
  highlight?: boolean;
}

export type RoleKey = 'staff' | 'manager' | 'general_manager' | 'finance';

type SidebarConfig = {
    [key in RoleKey]: SidebarItemData[];
};

interface CurrentUser {
    role: RoleKey; 
    firstName: string;
    lastName: string;
}



// Sidebar configuration for different user roles
const sidebarConfig: SidebarConfig = {
  
  staff: [
    { icon: Home, label: 'Dashboard', path: '.', description: 'Overview' }, 
    { icon: Plus, label: 'New Request', path: 'add', description: 'Create purchase request' }, 
    { icon: FileText, label: 'My Requests', path: 'my-requests', description: 'View/edit your requests' },
    { icon: Receipt, label: 'Submit Receipts', path: 'receit/submit', description: 'Upload receipts for approved requests' },
    // { icon: User, label: 'Profile', path: 'profile' }
  ],
  manager: [
    { icon: Home, label: 'Dashboard', path: '.', description: 'Overview' },
    { icon: Clock, label: 'Pending Approvals', path: 'my-requests', description: 'Level 1 requests awaiting approval' },
    { icon: CheckCircle, label: 'Reviewed Requests', path: 'reviewed', description: 'Requests you approved/rejected' },
    // { icon: User, label: 'Profile', path: 'profile' }
  ],
  general_manager: [
    { icon: Home, label: 'Dashboard', path: '.', description: 'Overview' },
    { icon: Clock, label: 'Pending Approvals', path: 'my-requests', description: 'Level 2 final approvals' },
    { icon: CheckCircle, label: 'Reviewed Requests', path: 'reviewed', description: 'Requests you approved/rejected' },
    // { icon: User, label: 'Profile', path: 'profile' }
  ],
  finance: [
    { icon: Home, label: 'Dashboard', path: '.', description: 'Overview' },
    { icon: DollarSign, label: 'Approved Requests', path: 'my-requests', description: 'All approved purchase requests' },
    { icon: FileText, label: 'Add Invoice', path: 'invoice/submit', description: 'View generated POs' },
    { icon: BarChart, label: '3 Match Verifying', path: 'reports', description: 'Financial reports & analytics' },
    // { icon: User, label: 'Profile', path: 'profile' }
  ]
};



interface SidebarItemProps {
    item: SidebarItemData;
}

const SidebarItem = ({ item }: SidebarItemProps) => {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      end={item.path === '.'} 
      className={({ isActive }) => {
        let classes = 'nav-link d-flex align-items-center rounded transition p-3';
        
        if (isActive) {
          classes += ' bg-primary text-white shadow'; 
        } else if (item.highlight) {
          classes += ' bg-secondary text-white';
        } else {
          classes += ' text-white-50 hover-bg-dark-subtle hover-text-white';
        }
        return classes;
      }}
      style={({ isActive }) => ({
        backgroundColor: isActive ? '#0d6efd' : item.highlight ? '#495057' : 'transparent',
      })}
    >
      <Icon size={20} className="me-3" />
      <div className="flex-grow-1 text-start">
        <p className="mb-0 fw-medium">{item.label}</p>
        {item.description && (
          <small className="opacity-75">{item.description}</small>
        )}
      </div>
      {item.badge && (
        <span className={'badge rounded-pill bg-danger ms-2'}>
          {item.badge}
        </span>
      )}
    </NavLink>
  );
};

interface SidebarContentProps {
    currentUser: CurrentUser;
}

const SidebarContent = ({ currentUser }: SidebarContentProps) => {
  const menuItems: SidebarItemData[] = sidebarConfig[currentUser.role] || [];

  return (
    <div className="d-flex flex-column h-100 bg-dark text-white">
    


     
      <div className="p-3 border-bottom border-secondary">
        <div className="d-flex align-items-center">
          <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white me-3" 
               style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>
            {currentUser.firstName[0]}{currentUser.lastName[0]}
          </div>
          <div>
            <p className="mb-0 fw-medium">{currentUser.firstName} {currentUser.lastName}</p>
            <small className="text-secondary text-capitalize">
              {currentUser.role.replace('_', ' ')}
            </small>
          </div>
        </div>
      </div>

     
      <nav className="flex-grow-1 overflow-auto p-3">
        <div className="nav flex-column">
          {menuItems.map((item, index) => (
            <SidebarItem key={item.path || index} item={item} /> 
          ))}
        </div>
      </nav>

     
      <div className="p-3 border-top border-secondary">
        <button className="btn btn-outline-secondary w-100 btn-sm">
          Logout
        </button>
      </div>
    </div>
  );
};


const DynamicSidebar = () => {
    const getInitialUser = (): CurrentUser => {
        const role = localStorage.getItem("role") as RoleKey | string | null;
        const validRoles: string[] = ['staff', 'manager', 'general_manager', 'finance'];
        const initialRole: RoleKey = (role && validRoles.includes(role)) ? role as RoleKey : 'staff';
        return {
            role: initialRole,
            firstName: "User",
            lastName: "Account",
        };
    };

    const [currentUser] = useState<CurrentUser>(getInitialUser);

    return (
        <div className="d-flex vh-100 bg-light">
            
            <aside className="position-fixed h-100" style={{ width: '280px', zIndex: 1030 }}>
                <SidebarContent currentUser={currentUser} />
            </aside>

            <main className="flex-grow-1 overflow-auto p-4" style={{ marginLeft: '280px' }}>
                <div className="container-fluid">
                    
     

                    <Outlet /> 
                    
                </div>
            </main>
        </div>
    );
};

export default DynamicSidebar;