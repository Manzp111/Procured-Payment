// src/components/RequestSummary.tsx
import type { PurchaseRequest } from "../types";

interface RequestSummaryProps {
  requests: PurchaseRequest[];
  userRole: string;
}

const RequestSummary = ({ requests, userRole }: RequestSummaryProps) => {
  // Calculate stats based on requests
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter(r => r.status === 'REJECTED').length;
  const totalSpend = requests
    .filter(r => r.status === 'APPROVED')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Request Summary</h2>
      </div>
      <div className="px-6 py-5">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm font-medium text-gray-500">
              <span>Pending</span>
              <span>{pendingCount}</span>
            </div>
            <div className="mt-1 rounded-full bg-gray-200 h-2">
              <div 
                className="rounded-full bg-yellow-500 h-2" 
                style={{ width: `${(pendingCount / requests.length) * 100 || 0}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm font-medium text-gray-500">
              <span>Approved</span>
              <span>{approvedCount}</span>
            </div>
            <div className="mt-1 rounded-full bg-gray-200 h-2">
              <div 
                className="rounded-full bg-green-500 h-2" 
                style={{ width: `${(approvedCount / requests.length) * 100 || 0}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm font-medium text-gray-500">
              <span>Rejected</span>
              <span>{rejectedCount}</span>
            </div>
            <div className="mt-1 rounded-full bg-gray-200 h-2">
              <div 
                className="rounded-full bg-red-500 h-2" 
                style={{ width: `${(rejectedCount / requests.length) * 100 || 0}%` }}
              ></div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Total Approved Spend</span>
              <span className="text-sm font-medium text-gray-900">
                ${totalSpend.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestSummary;