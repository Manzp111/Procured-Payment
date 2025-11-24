// src/components/RecentRequests.tsx
import type { PurchaseRequest } from '../types';

interface RecentRequestsProps {
  requests: PurchaseRequest[];
  loading: boolean;
  userRole: string;
}

const RecentRequests = ({ requests, loading, userRole }: RecentRequestsProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Recent Requests</h2>
      </div>
      <div className="overflow-hidden">
        {loading ? (
          <div className="px-6 py-4">
            <div className="animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="py-4 border-b border-gray-100 last:border-0">
                  <div className="flex items-center">
                    <div className="bg-gray-200 rounded h-4 w-1/4"></div>
                    <div className="ml-auto bg-gray-200 rounded h-4 w-8"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : requests.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {requests.map((request) => (
              <div key={request.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{request.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {request.description}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <span className="ml-4 text-sm font-medium text-gray-900">
                      ${request.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span>by {request.created_by.first_name} {request.created_by.last_name}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(request.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-gray-500">No requests found.</p>
          </div>
        )}
      </div>
      <div className="bg-gray-50 px-6 py-3">
        <button className="text-sm font-medium text-green-600 hover:text-green-500">
          View all requests
        </button>
      </div>
    </div>
  );
};

export default RecentRequests;