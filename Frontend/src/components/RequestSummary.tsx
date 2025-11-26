import React from "react";

// 1. Define the type for a single request object
interface RequestData {
    id: number;
    title: string;
    amount: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | string; // Adding more specific types
    created_by: {
        role: string;
    };
    current_level: number;
    created_at: string; // Needed for "Recently Added" calculation
}

// 2. Define the prop interface for the component
interface DashboardSummaryProps {
    requests: RequestData[];
}

// Helper component for a single summary card
interface SummaryCardProps {
    title: string;
    value: string | number;
    borderColor: string;
    textColor: string;
    icon?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, borderColor, textColor, icon }) => (
    <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-4">
        <div className={`card border-start border-${borderColor} border-4 h-100 shadow-sm`}>
            <div className="card-body">
                <div className="row align-items-center">
                    <div className="col">
                        <div className="text-xs fw-bold text-uppercase mb-1 text-muted">
                            {title}
                        </div>
                        <div className={`h5 mb-0 fw-bold text-${textColor}`}>
                            {value}
                        </div>
                    </div>
                    {icon && (
                        <div className="col-auto">
                            <i className={`fas ${icon} fa-2x text-gray-300`}></i>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
);


export default function DashboardSummary({ requests }: DashboardSummaryProps) {
    
    // --- HELPER FUNCTION ---
    const isToday = (dateString: string): boolean => {
        const today = new Date();
        const date = new Date(dateString);
        return date.toDateString() === today.toDateString();
    };

    // --- CALCULATIONS ---

    // 1. Total Requests
    const totalRequests = requests.length;

    // 2. Requests by Status
    const pendingRequests = requests.filter(req => req.status === "PENDING").length;
    const approvedRequests = requests.filter(req => req.status === "APPROVED").length;
    const rejectedRequests = requests.filter(req => req.status === "REJECTED").length;
    
    // 3. Recently Added (Assuming 'Recently Added' means created today)
    const recentlyAddedRequests = requests.filter(req => isToday(req.created_at)).length;

    // 4. Total Amount Requested
    const totalAmountRequested = requests.reduce((sum, req) => {
        const amount = parseFloat(req.amount) || 0;
        return sum + amount;
    }, 0);
    
    const formattedTotalAmount = totalAmountRequested.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD', 
        minimumFractionDigits: 2,
    });
    
    // --- RENDERING ---

    return (
        <div className="dashboard-summary">
            <h2 className="mb-4 text-primary fw-bold">Executive Dashboard Summary 📊</h2>
            
            <div className="row">
                
                {/* Card 1: Total Requests (Info) */}
                <SummaryCard
                    title="Total Requests"
                    value={totalRequests}
                    borderColor="info"
                    textColor="info"
                    icon="fa-list-ol"
                />
                
                {/* Card 2: Total Amount Requested (Primary Blue) */}
                <SummaryCard
                    title="Total Amount Requested"
                    value={formattedTotalAmount}
                    borderColor="primary"
                    textColor="primary"
                    icon="fa-dollar-sign"
                />
                
                {/* Card 3: Pending Approvals (Warning) */}
                <SummaryCard
                    title="Pending Approvals"
                    value={pendingRequests}
                    borderColor="warning"
                    textColor="warning"
                    icon="fa-hourglass-half"
                />
                
                {/* Card 4: Approved Requests (Success) */}
                <SummaryCard
                    title="Approved Requests"
                    value={approvedRequests}
                    borderColor="success"
                    textColor="success"
                    icon="fa-check-circle"
                />
                
                {/* Card 5: Rejected Requests (Danger) */}
                <SummaryCard
                    title="Rejected Requests"
                    value={rejectedRequests}
                    borderColor="danger"
                    textColor="danger"
                    icon="fa-times-circle"
                />

                {/* Card 6: Recently Added (Secondary) */}
                <SummaryCard
                    title="Recently Added (Today)"
                    value={recentlyAddedRequests}
                    borderColor="secondary"
                    textColor="secondary"
                    icon="fa-plus-square"
                />

            </div>
        </div>
    );
}// DashboardSummary.tsx (Your original file, included here for context)
import React from "react";

// 1. Define the type for a single request object
export interface RequestData { // Exported for use in the parent component
    id: number;
    title: string;
    amount: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | string;
    created_by: {
        role: string;
    };
    current_level: number;
    created_at: string;
}

// 2. Define the prop interface for the component
interface DashboardSummaryProps {
    requests: RequestData[];
}

export default function DashboardSummary({ requests }: DashboardSummaryProps) {
    
    // --- HELPER FUNCTION ---
    const isToday = (dateString: string): boolean => {
        const today = new Date();
        const date = new Date(dateString);
        return date.toDateString() === today.toDateString();
    };

    // --- CALCULATIONS ---
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(req => req.status === "PENDING").length;
    const approvedRequests = requests.filter(req => req.status === "APPROVED").length;
    const rejectedRequests = requests.filter(req => req.status === "REJECTED").length;
    const recentlyAddedRequests = requests.filter(req => isToday(req.created_at)).length;

    const totalAmountRequested = requests.reduce((sum, req) => {
        const amount = parseFloat(req.amount) || 0;
        return sum + amount;
    }, 0);
    
    const formattedTotalAmount = totalAmountRequested.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD', 
        minimumFractionDigits: 2,
    });
    
    // --- RENDERING ---
    // (Render logic remains the same, using the improved Bootstrap structure)
    // ...
    // (The rendering logic from your previous output is assumed here)
    // ...

    // Reverting to the simpler structure for brevity, assuming you will use the improved structure
    const SummaryCard = ({ title, value, borderColor, textColor }: { title: string, value: string | number, borderColor: string, textColor: string }) => (
        <div className={`p-3 bg-white rounded shadow-sm flex-fill border-start border-4 border-${borderColor}`}>
            <p className="text-muted mb-1 fw-semibold">{title}</p>
            <h5 className={`mb-0 fs-3 text-${textColor}`}>{value}</h5>
        </div>
    );

    return (
        <div className="dashboard-summary">
            <h2 className="mb-4 text-primary fw-bold">Executive Dashboard Summary 📊</h2>
            
            <div className="d-flex gap-3 flex-wrap">
                <SummaryCard title="Total Requests" value={totalRequests} borderColor="info" textColor="info" />
                <SummaryCard title="Total Amount Requested" value={formattedTotalAmount} borderColor="primary" textColor="primary" />
                <SummaryCard title="Pending Approvals" value={pendingRequests} borderColor="warning" textColor="warning" />
                <SummaryCard title="Approved Requests ✅" value={approvedRequests} borderColor="success" textColor="success" />
                <SummaryCard title="Rejected Requests ❌" value={rejectedRequests} borderColor="danger" textColor="danger" />
                <SummaryCard title="Recently Added (Today) 🆕" value={recentlyAddedRequests} borderColor="secondary" textColor="secondary" />
            </div>
        </div>
    );
}