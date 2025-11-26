import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, Alert, InputGroup } from "react-bootstrap";
import axios from "axios";
import { FileUp } from 'lucide-react';

// =================================================================
// INTERFACES (Ensure consistency with parent component)
// =================================================================

interface Request {
    id: number;
    title: string;
    description: string;
    amount: string; // Stored as string/decimal in backend
    vendor_name: string;
    proforma_url: string | null; // Added to display current file
    // ... other fields are omitted for this component's use
}

interface EditRequestModalProps {
    show: boolean;
    handleClose: () => void;
    request: Request | null; // Use the specific Request interface
    onUpdated: () => void; // callback to refresh parent
}

// =================================================================
// COMPONENT
// =================================================================

export default function EditRequestModal({ show, handleClose, request, onUpdated }: EditRequestModalProps) {
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState(''); 
    const [vendor, setVendor] = useState('');

    // --- New State for File Handling ---
    const [proformaFile, setProformaFile] = useState<File | null>(null);
    const [currentProformaUrl, setCurrentProformaUrl] = useState<string | null>(null);
    // ------------------------------------
    
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Effect to load data when request prop changes or modal shows ---
    useEffect(() => {
        if (request) {
            setTitle(request.title || '');
            setDescription(request.description || '');
            setAmount(request.amount || ''); 
            setVendor(request.vendor_name || '');
            setCurrentProformaUrl(request.proforma_url); // Store current URL
            setProformaFile(null); // Clear file input on open
            setError(null); 
        }
    }, [request, show]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setProformaFile(e.target.files[0]);
        } else {
            setProformaFile(null);
        }
    };


    const handleUpdate = async () => {
        setSubmitLoading(true);
        setError(null);
        const token = localStorage.getItem("accessToken");

        if (!token || !request) {
            setError("Authentication token missing or request data is incomplete.");
            setSubmitLoading(false);
            return;
        }

        // --- Data Preparation: Use FormData for file uploads ---
        const formData = new FormData();
        
        // Append text fields
        formData.append('title', title);
        formData.append('description', description);
        formData.append('amount', parseFloat(amount).toFixed(2));
        formData.append('vendor_name', vendor);

        // Append file if a new one is selected
        if (proformaFile) {
            formData.append('proforma', proformaFile);
        }
        
        // Note: axios uses 'multipart/form-data' automatically when using FormData
        try {
            const res = await axios.patch(
                `http://127.0.0.1:8000/api/requests/${request.id}/`,
                formData,
                { 
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        // Do NOT set Content-Type manually for FormData
                    } 
                }
            );

            if (res.data.success) {
                onUpdated(); 
                handleClose();
            } else {
                setError(res.data.message || "Failed to update request.");
            }
        } catch (err: any) {
            console.error("Update Error:", err);
            // Handle specific validation errors from the API response
            const responseErrors = err.response?.data?.errors;
            let errorMsg = err.response?.data?.message || "Error connecting to the API or unknown server error.";
            
            if (responseErrors) {
                // If the error relates to the proforma file, display it specifically
                if (responseErrors.proforma) {
                    errorMsg = `Proforma error: ${responseErrors.proforma[0]}`;
                }
            }
            setError(errorMsg);
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static" keyboard={!submitLoading} size="lg">
                <Modal.Header closeButton={!submitLoading} className="bg-primary text-white">
                    <Modal.Title>Edit Request - ID {request?.id}</Modal.Title>
                </Modal.Header>

                <Modal.Body className="bg-light p-4 rounded shadow-sm">
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form>
                    {/* Title */}
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">Title <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={submitLoading}
                        placeholder="Enter request title"
                        className="rounded-pill"
                        />
                    </Form.Group>

                    {/* Description */}
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">Description</Form.Label>
                        <Form.Control
                        as="textarea"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={submitLoading}
                        placeholder="Provide a detailed description"
                        className="rounded"
                        />
                    </Form.Group>

                    {/* Amount */}
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">Total Amount ($) <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={submitLoading}
                        placeholder="e.g., 1200.50"
                        className="rounded-pill"
                        />
                    </Form.Group>

                    {/* Vendor Name */}
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">Vendor Name</Form.Label>
                        <Form.Control
                        type="text"
                        value={vendor}
                        onChange={(e) => setVendor(e.target.value)}
                        disabled={submitLoading}
                        placeholder="Vendor name"
                        className="rounded-pill"
                        />
                    </Form.Group>

                    {/* Proforma File */}
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">Proforma Invoice (PDF/Image)</Form.Label>
                        <InputGroup className="mb-2 shadow-sm rounded">
                        <Form.Control
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            disabled={submitLoading}
                            className="rounded-start"
                        />
                        <InputGroup.Text className="bg-primary text-white rounded-end">
                            <FileUp size={18} />
                        </InputGroup.Text>
                        </InputGroup>

                        <Form.Text className="text-muted small">
                        {proformaFile 
                            ? <span className="badge bg-success">{`New file selected: ${proformaFile.name}`}</span> 
                            : currentProformaUrl 
                            ? <a href={currentProformaUrl} target="_blank" rel="noopener noreferrer" className="badge bg-info text-dark">Current Proforma attached. Upload new to replace.</a>
                            : <span className="text-warning">No file attached. Max 5MB, PDF/JPG/PNG.</span>
                        }
                        </Form.Text>
                    </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer className="border-0">
                    <Button variant="outline-secondary" onClick={handleClose} disabled={submitLoading}>
                    Cancel
                    </Button>
                    <Button variant="primary" onClick={handleUpdate} disabled={submitLoading}>
                    {submitLoading ? (
                        <>
                        <Spinner animation="border" size="sm" className="me-2" /> Saving...
                        </>
                    ) : (
                        "Save Changes"
                    )}
                    </Button>
                </Modal.Footer>
                </Modal>

    );
}