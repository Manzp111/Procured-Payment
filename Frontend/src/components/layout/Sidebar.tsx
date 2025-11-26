import React, { useState } from 'react';
// Imports for navigation and component rendering
import { NavLink, Outlet } from 'react-router-dom';
import { 
  Home, Plus, FileText, Clock, CheckCircle, Receipt, DollarSign, 
  AlertTriangle, BarChart, User 
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// =================================================================
// 1. DEFINE CORE TYPESCRIPT INTERFACES & TYPES
// =================================================================

/** Defines the structure for a single item in the sidebar configuration. */
export interface SidebarItemData {
  icon: LucideIcon; 
  label: string;
  path: string;
  description?: string;
  badge?: number;
  highlight?: boolean;
}

/** Defines the union of all valid roles. */
export type RoleKey = 'staff' | 'manager' | 'general_manager' | 'finance';

/** Defines the structure for the entire sidebar configuration object. */
type SidebarConfig = {
    [key in RoleKey]: SidebarItemData[];
};

/** Defines the shape of the current user object */
interface CurrentUser {
    role: RoleKey; 
    firstName: string;
    lastName: string;
}

// =================================================================
// 2. CONFIGURATION (Paths are relative to the /dashboard parent route)
// =================================================================

const sidebarConfig: SidebarConfig = {
  staff: [
    { icon: Home, label: 'Dashboard', path: '.', description: 'Overview' }, 
    // 💡 RESTORED: 'New Request' mapping to 'about' path
    { icon: Plus, label: 'New Request', path: 'add', description: 'Create purchase request' }, 
    { icon: FileText, label: 'My Requests', path: 'my-requests', description: 'View/edit your requests' },
    { icon: Receipt, label: 'Submit Receipts', path: 'receit/submit', description: 'Upload receipts for approved requests' },
    { icon: User, label: 'Profile', path: 'profile' }
  ],
  manager: [
    { icon: Home, label: 'Dashboard', path: '.', description: 'Overview' },
    { icon: Clock, label: 'Pending Approvals', path: 'my-requests', description: 'Level 1 requests awaiting approval' },
    { icon: CheckCircle, label: 'Reviewed Requests', path: 'reviewed', description: 'Requests you approved/rejected' },
    { icon: User, label: 'Profile', path: 'profile' }
  ],
  general_manager: [
    { icon: Home, label: 'Dashboard', path: '.', description: 'Overview' },
    { icon: Clock, label: 'Pending Approvals', path: 'my-requests', description: 'Level 2 final approvals' },
    { icon: CheckCircle, label: 'Reviewed Requests', path: 'reviewed', description: 'Requests you approved/rejected' },
    { icon: User, label: 'Profile', path: 'profile' }
  ],
  finance: [
    { icon: Home, label: 'Dashboard', path: '.', description: 'Overview' },
    { icon: DollarSign, label: 'Approved Requests', path: 'my-requests', description: 'All approved purchase requests', badge: 12 },
    { icon: FileText, label: 'Purchase Orders', path: 'purchase-orders', description: 'View generated POs' },
    { icon: AlertTriangle, label: 'Discrepancies', path: 'discrepancies', description: '3-way matching issues', badge: 2 },
    { icon: BarChart, label: 'Reports', path: 'reports', description: 'Financial reports & analytics' },
    { icon: User, label: 'Profile', path: 'profile' }
  ]
};



interface SidebarItemProps {
    item: SidebarItemData;
}

const SidebarItem = ({ item }: SidebarItemProps) => {
  const Icon = item.icon;

  return (
    // Bootstrap 5 classes
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
      // Custom style to achieve the dark sidebar look
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
      {/* Header */}


      {/* User Info */}
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

      {/* Navigation Menu */}
      <nav className="flex-grow-1 overflow-auto p-3">
        <div className="nav flex-column">
          {menuItems.map((item, index) => (
            <SidebarItem key={item.path || index} item={item} /> 
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-top border-secondary">
        <button className="btn btn-outline-secondary w-100 btn-sm">
          Logout
        </button>
      </div>
    </div>
  );
};


const DynamicSidebar = () => {
    // Function to safely retrieve role from localStorage
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
        // Full Page Layout using Bootstrap Flex Utilities
        <div className="d-flex vh-100 bg-light">
            
            <aside className="position-fixed h-100" style={{ width: '280px', zIndex: 1030 }}>
                <SidebarContent currentUser={currentUser} />
            </aside>

            <main className="flex-grow-1 overflow-auto p-4" style={{ marginLeft: '280px' }}>
                <div className="container-fluid">
                    
     

                    {/* 💡 THE OUTLET: This is where the RequestTable or other page content renders */}
                    <Outlet /> 
                    
                </div>
            </main>
        </div>
    );
};

export default DynamicSidebar;