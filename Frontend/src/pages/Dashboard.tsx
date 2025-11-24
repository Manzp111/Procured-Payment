// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { PurchaseRequest, User } from '../types';
import StatCard from '../components/StatCard';
import RecentRequests from '../components/RecentRequests';
import RequestSummary from '../components/RequestSummary';

const Dashboard = () => {
  const { user } = useAuth() as { user: User | null };
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch requests based on user role
    const fetchRequests = async () => {
      try {
        // In a real app, this would call your API:
        // const response = await fetch(`/api/requests/`, {
        //   headers: { 'Authorization': `Bearer ${token}` }
        // });
        // const data = await response.json();
        // setRequests(data);
        
        // For now, use mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        setRequests(mockRequests);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch requests', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchRequests();
    }
  }, [user]);

  // Prevent rendering if user is not available
  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Stats based on user role
  const getStats = () => {
    if (user.role === 'staff') {
      return [
        { title: 'Pending Requests', value: '3', change: '+1', color: 'bg-blue-500' },
        { title: 'Approved Requests', value: '12', change: '+2', color: 'bg-green-500' },
        { title: 'Total Spend', value: '$56,240', change: '+15%', color: 'bg-purple-500' },
        { title: 'Receipts Pending', value: '2', change: '-1', color: 'bg-yellow-500' },
      ];
    }
    
    if (user.role === 'manager' || user.role === 'general_manager') {
      return [
        { title: 'Pending Approvals', value: '5', change: '+2', color: 'bg-orange-500' },
        { title: 'Approved This Month', value: '18', change: '+3', color: 'bg-green-500' },
        { title: 'Rejected Requests', value: '2', change: '0', color: 'bg-red-500' },
        { title: 'Avg. Approval Time', value: '1.2 days', change: '-0.3d', color: 'bg-blue-500' },
      ];
    }
    
    if (user.role === 'finance') {
      return [
        { title: 'Approved Requests', value: '42', change: '+8', color: 'bg-green-500' },
        { title: 'Total Spend', value: '$184,240', change: '+22%', color: 'bg-purple-500' },
        { title: 'Discrepancies', value: '3', change: '-1', color: 'bg-red-500' },
        { title: 'Receipts Validated', value: '38', change: '+5', color: 'bg-blue-500' },
      ];
    }
    
    // Admin stats
    return [
      { title: 'Total Requests', value: '86', change: '+12', color: 'bg-blue-500' },
      { title: 'Pending Approvals', value: '7', change: '+2', color: 'bg-orange-500' },
      { title: 'Total Spend', value: '$240,480', change: '+37%', color: 'bg-purple-500' },
      { title: 'Active Users', value: '24', change: '+3', color: 'bg-green-500' },
    ];
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user.first_name}! Here's what's happening with your procurement.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard 
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            color={stat.color}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentRequests 
            requests={requests} 
            loading={loading} 
            userRole={user.role}
          />
        </div>
        <div>
          <RequestSummary 
            requests={requests} 
            userRole={user.role}
          />
        </div>
      </div>
    </div>
  );
};

// Mock data for demonstration - matches Payhawk's procure-to-pay workflow
const mockRequests: PurchaseRequest[] = [
  {
    id: 1,
    title: "Laptops for Dev Team",
    description: "Dell XPS 15 for new developers",
    amount: 15000,
    status: "PENDING",
    current_level: 1,
    created_by: { first_name: "John", last_name: "Doe" },
    created_at: "2023-10-15T10:30:00Z",
    extraction_status: "SUCCESS",
    vendor_name: "Tech Solutions Rwanda Ltd",
    three_way_match_status: "PENDING"
  },
  {
    id: 2,
    title: "Office Supplies",
    description: "Printer paper, pens, and notebooks",
    amount: 350,
    status: "APPROVED",
    current_level: 2,
    created_by: { first_name: "Sarah", last_name: "Johnson" },
    created_at: "2023-10-12T14:15:00Z",
    extraction_status: "SUCCESS",
    vendor_name: "Office Depot Rwanda",
    three_way_match_status: "MATCHED"
  },
  {
    id: 3,
    title: "Conference Registration",
    description: "Tech conference in Kigali",
    amount: 1200,
    status: "REJECTED",
    current_level: 1,
    created_by: { first_name: "Mike", last_name: "Smith" },
    created_at: "2023-10-10T09:45:00Z",
    extraction_status: "SUCCESS",
    vendor_name: "Kigali Tech Events",
    three_way_match_status: "PENDING"
  },
  {
    id: 4,
    title: "Server Upgrade",
    description: "New server hardware for database",
    amount: 8500,
    status: "APPROVED",
    current_level: 2,
    created_by: { first_name: "John", last_name: "Doe" },
    created_at: "2023-10-08T16:20:00Z",
    extraction_status: "SUCCESS",
    vendor_name: "CloudTech Solutions",
    three_way_match_status: "DISCREPANCY"
  }
];

export default Dashboard;