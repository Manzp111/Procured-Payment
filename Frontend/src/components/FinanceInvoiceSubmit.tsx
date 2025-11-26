import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Alert, Spinner, Badge } from "react-bootstrap";
import axios from "axios";

//interface Request 
interface Request {
  id: number;
  title: string;
  amount: string;
  purchase_order_url: string | null;
  proforma_url: string | null;
  receipt_url: string | null;
  invoice_url: string | null; 
  three_way_match_status: "PENDING" | "MATCHED" | "DISCREPANCY";
}

export default function FinanceInvoicePage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch requests from API
  const fetchRequests = async () => {
    setLoading(true);
    setMessage(null);
    setIsError(false);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get("http://127.0.0.1:8000/api/requests/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        
        setRequests(res.data.data.results);
      } else {
        setMessage(res.data.message || "Failed to fetch requests");
        setIsError(true);
      }
    } catch (err) {
      console.error(err);
      setMessage("Error connecting to API");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setInvoiceFile(e.target.files[0]);
  };

  const handleOpenModal = (req: Request) => {
    setSelectedRequest(req);
    setInvoiceFile(null); 
    setShowModal(true);
  };

  const handleSubmitInvoice = async () => {
    if (!selectedRequest || !invoiceFile) return;
    setSubmitting(true);
    const formData = new FormData();
    formData.append("invoice", invoiceFile);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.post(
        `http://127.0.0.1:8000/api/requests/${selectedRequest.id}/finance-submit-invoice/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check for success property in the response data
      if (res.data.success) {
        setMessage(`Invoice submitted/updated for ${selectedRequest.title}`);
        setIsError(false);
        fetchRequests();
        setShowModal(false);
        setInvoiceFile(null);
      } else {
        setMessage(res.data.message || "Failed to submit invoice");
        setIsError(true);
      }
    } catch (err: any) {
      console.error(err);
      // Try to extract a specific error message from the response
      const apiErrorMessage = err.response?.data?.message || err.response?.data?.invoice?.[0] || "Error submitting invoice";
      setMessage(apiErrorMessage);
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "MATCHED":
        return "success";
      case "PENDING":
        return "warning";
      case "DISCREPANCY":
        return "danger";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <Spinner animation="border" variant="primary" role="status" className="me-2" />
        <span className="text-primary fw-medium">Loading requests...</span>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-dark fw-bold">Finance - Submit Invoices</h2>

      {message && (
        <Alert variant={isError ? "danger" : "success"} onClose={() => setMessage(null)} dismissible>
          {message}
        </Alert>
      )}

      <div className="table-responsive bg-white rounded shadow-sm">
        <Table hover className="m-0 align-middle">
          <thead>
            <tr>
              <th>Title</th>
              <th>Amount</th>
              <th>Purchase Order</th>
              <th>Proforma</th>
              <th>Receipt</th>
              <th>Invoice File</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => {
              const isMatched = req.three_way_match_status === "MATCHED";
              // Check for the presence of the invoice URL
              const hasInvoice = !!req.invoice_url;

              return (
                <tr key={req.id}>
                  <td>{req.title}</td>
                  <td>
                    {parseFloat(req.amount).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </td>
                  <td>
                    {req.purchase_order_url ? (
                      <a href={req.purchase_order_url} target="_blank" rel="noopener noreferrer">View PO</a>
                    ) : "N/A"}
                  </td>
                  <td>
                    {req.proforma_url ? (
                      <a href={req.proforma_url} target="_blank" rel="noopener noreferrer">View Proforma</a>
                    ) : "N/A"}
                  </td>
                  <td>
                    {req.receipt_url ? (
                      <a href={req.receipt_url} target="_blank" rel="noopener noreferrer">View Receipt</a>
                    ) : "N/A"}
                  </td>
                  {/*Show Invoice File or Pending status */}
                  <td>
                    {hasInvoice ? (
                      <a href={req.invoice_url!} target="_blank" rel="noopener noreferrer">
                        View Invoice
                      </a>
                    ) : (
                      <Badge bg="secondary">None</Badge>
                    )}
                  </td>
                  <td>
                    <Badge bg={getStatusVariant(req.three_way_match_status)} className="py-2 px-3 fw-bold">
                      {req.three_way_match_status}
                    </Badge>
                  </td>
                  <td>
                    {isMatched ? (
                      <Button
                        // Use conditional variant and text based on hasInvoice
                        variant={hasInvoice ? "outline-warning" : "success"}
                        size="sm"
                        onClick={() => handleOpenModal(req)}
                      >
                        {hasInvoice ? "Change Invoice" : "Add Invoice"}
                      </Button>
                    ) : (
                      <span className="text-muted">Not Ready</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {/* Invoice Submission Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedRequest?.invoice_url ? "Change Invoice" : "Submit Invoice"} - {selectedRequest?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="invoiceFile">
            <Form.Label>Invoice PDF</Form.Label>
            <Form.Control type="file" accept="application/pdf" onChange={handleFileChange} />
            <Form.Text className="text-muted">
                {selectedRequest?.invoice_url 
                    ? `Current invoice exists. Uploading will replace it.`
                    : `Max size: 5MB`}
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitInvoice} disabled={submitting || !invoiceFile}>
            {submitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" /> Submitting...
              </>
            ) : (
              // Conditional button text based on whether an invoice already exists
              selectedRequest?.invoice_url ? "Update Invoice" : "Submit Invoice"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}