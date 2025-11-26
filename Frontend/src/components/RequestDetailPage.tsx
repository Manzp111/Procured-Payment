import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import axios from "axios";
import EditRequestModal from "./EditRequestModal";

interface RequestDetailModalProps {
    show: boolean;
    handleClose: () => void;
    requestId: number | null;
    editable: boolean; // true for staff, false for finance
}

interface Request {
    id: number;
    title: string;
    description: string;
    amount: string;
    status: string;
    vendor_name: string;
    proforma: string | null;
    purchase_order: string | null;
}

export default function RequestDetailModal({ show, handleClose, requestId, editable }: RequestDetailModalProps) {
    const [request, setRequest] = useState<Request | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [editModalShow, setEditModalShow] = useState(false);

    const fetchRequestDetails = async () => {
        if (!requestId) return;
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/requests/${requestId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setRequest(res.data.data);
        } catch (err) {
            console.error(err);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchRequestDetails(); }, [requestId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
    };

    const handleSubmitReceipt = async () => {
        if (!file || !requestId) return;
        setSubmitLoading(true);
        const formData = new FormData();
        formData.append('receipt', file);
        const token = localStorage.getItem("accessToken");

        try {
            const res = await axios.post(
                `http://127.0.0.1:8000/api/requests/${requestId}/submit_receipt/`,
                formData,
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
            );
            if (res.data.success) {
                alert("Receipt submitted successfully!");
                fetchRequestDetails();
            } else {
                alert(res.data.message || "Failed to submit receipt.");
            }
        } catch (err) {
            console.error(err);
            alert("Error submitting receipt.");
        } finally { setSubmitLoading(false); }
    };

    if (!request) return <Modal show={show} onHide={handleClose} centered><Spinner animation="border" /></Modal>;

    const canEdit = editable && request.status.toUpperCase() === "PENDING";

    return (
        <>
            <Modal show={show} onHide={handleClose} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Request Details - ID {request.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Title:</strong> {request.title}</p>
                    <p><strong>Description:</strong> {request.description}</p>
                    <p><strong>Amount:</strong> {parseFloat(request.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                    <p><strong>Vendor:</strong> {request.vendor_name}</p>
                    {request.proforma && <p><a href={request.proforma} target="_blank">View Proforma</a></p>}
                    {request.purchase_order && <p><a href={request.purchase_order} target="_blank">View Purchase Order</a></p>}

                    {/* Staff: Upload Receipt */}
                    {editable && request.status.toUpperCase() === "APPROVED" && (
                        <Form.Group className="mt-3">
                            <Form.Label>Upload Receipt (PDF)</Form.Label>
                            <Form.Control type="file" accept="application/pdf" onChange={handleFileChange} />
                            <Button className="mt-2" onClick={handleSubmitReceipt} disabled={submitLoading}>
                                {submitLoading ? <Spinner animation="border" size="sm" /> : "Submit Receipt"}
                            </Button>
                        </Form.Group>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                    {canEdit && (
                        <Button variant="warning" onClick={() => setEditModalShow(true)}>
                            Edit Request
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>

            {/* Edit Request Modal */}
            {canEdit && request && (
                <EditRequestModal
                    show={editModalShow}
                    handleClose={() => setEditModalShow(false)}
                    request={request}
                    onUpdated={fetchRequestDetails}
                />
            )}

            

            
        </>
    );
}
