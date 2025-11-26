import React, { useEffect, useState, useCallback } from "react";
import { 
    Table, Button, Alert, Spinner, Badge, ButtonGroup, 
    InputGroup, FormControl, Pagination, Modal,Form
} from "react-bootstrap";
// REMOVED: useNavigate import for page routing
// import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import { Check, X, Search, Filter } from 'lucide-react'; 

// RE-INTRODUCED: Import the modal component
import RequestDetailModal from './RequestDetailPage'; 
// **FIX: IMPORT THE MISSING EDIT MODAL COMPONENT**
import EditRequestModal from './EditRequestModal'; 


// =================================================================
// 1. INTERFACES (Full definition for self-containment)
// =================================================================

interface CreatedBy {
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
    full_name: string;
    role: string;
}

interface Item {
    name: string;
    price: number;
    quantity: number;
}

interface Request {
    id: number;
    title: string;
    description: string;
    amount: string;
    status: string;
    created_by: CreatedBy;
    current_level: number;
    proforma: string | null;
    items_json: Item[];
    vendor_name: string;
}

interface PaginatedData {
    count: number;
    next: string | null;
    previous: string | null;
    results: Request[];
}

// =================================================================
// 2. UTILITIES
// =================================================================

/** Maps request status to a Bootstrap variant for consistent styling. */
const getStatusVariant = (status: string) => {
    switch (status.toUpperCase()) {
        case "PENDING":
            return "warning";
        case "APPROVED":
            return "success";
        case "REJECTED":
            return "danger";

        default:
            return "secondary";
    }
};

// =================================================================
// 3. MAIN COMPONENT
// =================================================================

export default function RequestsTable() {
    
    // REMOVED: Initialize useNavigate for routing
    // const navigate = useNavigate();

    // --- State Management ---
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState<string>('');

    // --- Pagination & Filtering State ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [currentFilterStatus, setCurrentFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    // RE-INTRODUCED MODAL STATE
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
    // **FIX: EDIT MODAL STATE IS ALREADY DEFINED**
    const [editModalShow, setEditModalShow] = useState(false);
    const [editRequestData, setEditRequestData] = useState<Request | null>(null);


    const StatusOptions = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

    // --- Approve/Reject Confirmation Modal State ---
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [actionTarget, setActionTarget] = useState<{ requestId: number; action: 'approve' | 'reject' } | null>(null);
    const [commentInput, setCommentInput] = useState('');


    // --- Data Fetching Logic (Memoized) ---
    const fetchRequests = useCallback(async (page: number, statusFilter: string, search: string) => {
        setLoading(true);
        setMessage(null);
        setIsError(false);

        const apiUrl = 'http://127.0.0.1:8000';
        const accessToken = localStorage.getItem("accessToken");
        const role = localStorage.getItem("role") || 'staff';

        if (!accessToken) {
            setMessage("Authentication required. Access token is missing.");
            setIsError(true);
            setLoading(false);
            return;
        }

        try {
            let url = `${apiUrl}/api/requests/?page=${page}`;
            
            if ((role === 'manager' || role === 'general_manager') && statusFilter === 'all') {
                
                url += '&status=PENDING';
            }
            else if (role === 'finance' && statusFilter === 'all') {
                
                url += '&status=APPROVED';

            }
            else if (statusFilter !== 'all') {
                
                url += `&status=${statusFilter.toUpperCase()}`;

            }

            if (search) {
                url += `&search=${search}`;
            }
            
            const res = await axios.get(url, { 
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const paginatedData: PaginatedData = res.data.data;
            const requestData = paginatedData.results; 

            if (res.data.success && Array.isArray(requestData)) {
                setRequests(requestData);
                // Assuming 10 items per page based on the Math.ceil logic
                const totalCount = paginatedData.count;
                setTotalPages(Math.ceil(totalCount / 10)); 
            } else {
                setMessage(res.data.message || "Failed to retrieve data.");
                setIsError(true);
            }
        } catch (error: any) {
            console.error("API Fetch Error:", error);
            const errorMsg = error.response?.data?.message || "Error connecting to the API.";
            setMessage(errorMsg);
            setIsError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    // --- Effects ---
    useEffect(() => {
        const role = localStorage.getItem("role") || 'staff';
        setCurrentUserRole(role);
    }, []);

    useEffect(() => {
        // Reset page to 1 whenever filters change
        fetchRequests(currentPage, currentFilterStatus, searchQuery);
    }, [currentPage, currentFilterStatus, searchQuery, fetchRequests]);

    const handleApproveOrReject = async (
        requestId: number,
        action: 'approve' | 'reject',
        comment: string = ''
    ) => {
        const apiUrl = 'http://127.0.0.1:8000';
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return setMessage("Authentication required");

        const formData = new FormData();
        formData.append('comment', comment);

        try {
            const response = await axios.patch(
                `${apiUrl}/api/requests/${requestId}/${action}/`,
                formData,
                { headers: { 'Authorization': `Bearer ${accessToken}` } }
            );

            if (response.data.success) {
                setMessage(`Request ID ${requestId} successfully ${action}d.`);
                setIsError(false);
                fetchRequests(currentPage, currentFilterStatus, searchQuery);
            } else {
                setMessage(response.data.message || `Failed to ${action} Request ID ${requestId}.`);
                setIsError(true);
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || `Error during ${action}.`;
            setMessage(errorMsg);
            setIsError(true);
        }
    };

    
    // --- Utility Handlers ---

    // 💡 UPDATED to use modal state
    const handleRowClick = (id: number) => {
        setSelectedRequestId(id);
        setShowDetailModal(true);
    };

    // RE-INTRODUCED handleModalClose (for RequestDetailModal)
    const handleModalClose = () => {
        setShowDetailModal(false);
        setSelectedRequestId(null);
        // Ensure list view is refreshed after closing the modal, in case of actions taken inside
        fetchRequests(currentPage, currentFilterStatus, searchQuery);
    };

    // **FIX: ADDED HANDLER FOR EDIT MODAL CLOSE**
    const handleEditModalClose = () => {
        setEditModalShow(false);
        setEditRequestData(null);
        // Refresh the list after editing is done/closed
        fetchRequests(currentPage, currentFilterStatus, searchQuery);
    };


    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (status: string) => {
        setCurrentFilterStatus(status);
        setCurrentPage(1);
    };

   

    const isApprover = currentUserRole === 'manager' || currentUserRole === 'general_manager';
    const isFinance = currentUserRole === 'finance';

    const getTableTitle = () => {
        if (currentUserRole === 'staff') return 'My Purchase Requests';
        if (currentUserRole === 'finance') return 'Approved & Paid Requests';
        if (isApprover) return 'Approval Dashboard';
        return 'Requests List';
    }

    // --- Loading/Empty State ---
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center p-5">
                <Spinner animation="border" variant="primary" role="status" className="me-2" />
                <span className="text-primary fw-medium">Loading requests...</span>
            </div>
        );
    }

    if (requests.length === 0 && !isError) {
        let emptyMessage = "No requests found matching your current filter or search criteria.";
        if (searchQuery) {
            emptyMessage = `No requests matching "${searchQuery}" found.`;
        } else if (currentUserRole === 'staff') {
            emptyMessage = "You haven't created any requests yet. Click 'New Request' to start.";
        } else if (isApprover && (currentFilterStatus === 'pending' || currentFilterStatus === 'all')) {
            emptyMessage = "Congratulations! There are no pending requests requiring your approval.";
        }
        
        return (
            <Alert variant="info" className="mt-4">
                <h4 className="alert-heading">No Requests Found</h4>
                <p>{emptyMessage}</p>
            </Alert>
        );
    }


    // --- Main Render ---
    return (
        <div className="container-fluid mt-4">
            <h2 className="mb-4 text-dark fw-bold">
                {getTableTitle()}
            </h2>
            
            {/* Alert Display */}
            {message && (
                <Alert variant={isError ? "danger" : "success"} onClose={() => setMessage(null)} dismissible>
                    {message}
                </Alert>
            )}

            {/* Top Toolbar: Filter & Search */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                
                {/* Status Filter Buttons */}
                <ButtonGroup>
                    <Filter size={18} className="me-2 text-secondary align-self-center" />
                    {StatusOptions.map(status => (
                        <Button
                            key={status}
                            variant={currentFilterStatus.toUpperCase() === status ? 'primary' : 'outline-secondary'}
                            size="sm"
                            onClick={() => handleStatusFilterChange(status.toLowerCase())}
                        >
                            {status}
                        </Button>
                    ))}
                </ButtonGroup>

                {/* Search Input */}
                <InputGroup className="w-25">
                    <FormControl
                        placeholder="Search by Title, Vendor..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <InputGroup.Text><Search size={16} /></InputGroup.Text>
                </InputGroup>
            </div>
            
            {/* Requests Table */}
            <div className="table-responsive bg-white rounded shadow-sm">
                <Table hover className="m-0 align-middle">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            {(isApprover || isFinance) && <th>Created By</th>}
                            <th>Amount</th>
                            <th>Status</th>
                            {isApprover && <th>Approval Lvl</th>}
                            <th>Vendor</th>
                            <th style={{ width: isApprover ? '180px' : '100px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((request) => (
                            <tr 
                                key={request.id} 
                                className="cursor-pointer" 
                                onClick={() => handleRowClick(request.id)} // Row click opens modal
                            >
                                <td>{request.id}</td>
                                <td className="fw-medium text-primary">{request.title}</td>
                                {(isApprover || isFinance) && (
                                    <td>{request.created_by.full_name}</td>
                                )}
                                <td>
                                    {/* Currency Formatting */}
                                    {parseFloat(request.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                </td>
                                <td>
                                    <Badge bg={getStatusVariant(request.status)} className="py-2 px-3 fw-bold">
                                        {request.status.toUpperCase()}
                                    </Badge>
                                </td>
                                {isApprover && <td>{request.current_level}</td>}
                                <td>{request.vendor_name || 'N/A'}</td>
                                
                                {/* Action Column */}

                                
                                <td>
                                <ButtonGroup size="sm" onClick={(e) => e.stopPropagation()}>

                                        {/* Edit button (only staff + pending) */}
                                        {currentUserRole === 'staff' && request.status === 'PENDING' && (
                                            <Button
                                                variant="warning"
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    // Load request data for edit
                                                    const token = localStorage.getItem("accessToken");
                                                    try {
                                                        const res = await axios.get(`http://127.0.0.1:8000/api/requests/${request.id}/`, {
                                                            headers: { Authorization: `Bearer ${token}` }
                                                        });
                                                        if (res.data.success) {
                                                            setEditRequestData(res.data.data);
                                                            setEditModalShow(true); // **THIS LINE CORRECTLY SETS THE STATE TO SHOW THE MODAL**
                                                        } else {
                                                            alert("Failed to load request for editing");
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert("Error loading request for edit");
                                                    }
                                                }}
                                                title="Edit Request"
                                            >
                                                Edit
                                            </Button>
                                        )}

                                        
                                {/* Manager approve/reject buttons */}
                                {isApprover && request.status === 'PENDING' && (
                                    <>
                                        <Button
                                            variant="success"
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                setActionTarget({ requestId: request.id, action: 'approve' }); 
                                                setShowConfirmModal(true);
                                            }}
                                            title="Approve Request"
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                setActionTarget({ requestId: request.id, action: 'reject' }); 
                                                setShowConfirmModal(true);
                                            }}
                                            title="Reject Request"
                                        >
                                            Reject
                                        </Button>
                                    </>
                                )}
                                    </ButtonGroup>

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="d-flex justify-content-center mt-4">
                <Pagination>
                    <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                    <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} />
                    
                    {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                            return (
                                <Pagination.Item key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>
                                    {page}
                                </Pagination.Item>
                            );
                        }
                        if (page === currentPage - 2 || page === currentPage + 2) {
                            return <Pagination.Ellipsis key={`ellipsis-${page}`} disabled />;
                        }
                        return null;
                    })}
                    
                    <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} />
                    <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                </Pagination>
            </div>

            {/* RE-ADDED DETAIL MODAL COMPONENT */}
            <RequestDetailModal
                show={showDetailModal}
                handleClose={handleModalClose}
                requestId={selectedRequestId}
                onAction={handleApproveOrReject} 
                
            />
            
            {/* **FIX: RENDER THE EDIT MODAL COMPONENT HERE** */}
            {editRequestData && (
                <EditRequestModal
                    show={editModalShow}
                    handleClose={handleEditModalClose} // New handler to close and refresh
                    request={editRequestData} // Data loaded when edit is clicked
                    onUpdated={() => fetchRequests(currentPage, currentFilterStatus, searchQuery)} // Pass refresh logic
                />
            )}


            {/* Approve / Reject Confirmation Modal */}
            <Modal
                show={showConfirmModal}
                onHide={() => setShowConfirmModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {actionTarget?.action === 'approve' ? 'Approve Request' : 'Reject Request'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p>
                        Are you sure you want to {actionTarget?.action} Request ID {actionTarget?.requestId}?
                    </p>
                    <Form>
                        <Form.Group controlId="commentInput">
                            <Form.Label>Optional Comment</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={2} 
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                placeholder="Add a comment (optional)"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        No
                    </Button>
                    <Button
                        variant={actionTarget?.action === 'approve' ? 'success' : 'danger'}
                        onClick={async () => {
                            if (actionTarget) {
                                await handleApproveOrReject(actionTarget.requestId, actionTarget.action, commentInput);
                            }
                            setShowConfirmModal(false);
                            setActionTarget(null);
                            setCommentInput('');
                        }}
                    >
                        Yes
                    </Button>
                </Modal.Footer>
            </Modal>
            

        </div>
    );
}