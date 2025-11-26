import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Spinner, Modal, Alert, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

interface Request {
  id: number;
  title: string;
  amount: string;
  status: string;
  three_way_match_status: string;
  receipt_url: string | null;
  proforma_url: string | null;
  purchase_order_url: string | null;
}

const SubmitReceipts: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loadingIds, setLoadingIds] = useState<number[]>([]);
  const [verifyingIds, setVerifyingIds] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modalRequestId, setModalRequestId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  // Redirect if not logged in
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const fetchRequests = async () => {
    if (!token) return;
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/requests/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: Request[] = response.data.data.results;
      const filtered = data.filter(
        (r) =>
          r.status === "APPROVED" &&
          ["PENDING", "DISCREPANCY"].includes(r.three_way_match_status)
      );
      setRequests(filtered);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load requests.");
      setError(true);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [token]);

  const openModal = (requestId: number) => {
    setModalRequestId(requestId);
    setSelectedFile(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) setSelectedFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!modalRequestId || !selectedFile) {
      setMessage("Please select a file before submitting.");
      setError(true);
      return;
    }

    const formData = new FormData();
    formData.append("receipt", selectedFile);
    const apiUrl = `http://127.0.0.1:8000/api/requests/${modalRequestId}/submit_receipt/`;

    try {
      setLoadingIds((prev) => [...prev, modalRequestId]);
      setVerifyingIds((prev) => [...prev, modalRequestId]);

      const res = await axios.post(apiUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("Receipt submitted. Verifying...");
      setError(false);
      setModalRequestId(null);

      // Poll backend until status changes from PENDING/DISCREPANCY
      const pollVerification = setInterval(async () => {
        try {
          const r = await axios.get(`http://127.0.0.1:8000/api/requests/${modalRequestId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const updatedRequest = r.data.data;
          if (!["PENDING", "DISCREPANCY"].includes(updatedRequest.three_way_match_status)) {
            setRequests((prev) =>
              prev.map((req) => (req.id === updatedRequest.id ? updatedRequest : req))
            );
            setVerifyingIds((prev) => prev.filter((id) => id !== updatedRequest.id));
            clearInterval(pollVerification);
          }
        } catch (err) {
          console.error(err);
        }
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.message || "Error submitting receipt.");
      setError(true);
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== modalRequestId!));
    }
  };

  return (
    <div className="container mt-4">
      <h3>Submit Receipts</h3>

      {message && (
        <Alert variant={error ? "danger" : "success"} dismissible onClose={() => setMessage(null)}>
          {message}
        </Alert>
      )}

      {requests.length === 0 ? (
        <p>No approved requests pending receipt submission.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Title</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Proforma</th>
              <th>PO</th>
              <th>Receipt</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.title}</td>
                <td>{req.amount}</td>
                <td>{verifyingIds.includes(req.id) ? "Verifying..." : req.three_way_match_status}</td>
                <td>
                  {req.proforma_url ? (
                    <a href={req.proforma_url} target="_blank" rel="noopener noreferrer">
                      View Proforma
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  {req.purchase_order_url ? (
                    <a href={req.purchase_order_url} target="_blank" rel="noopener noreferrer">
                      View PO
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  {req.receipt_url ? (
                    <a href={req.receipt_url} target="_blank" rel="noopener noreferrer">
                      View Receipt
                    </a>
                  ) : (
                    "No receipt"
                  )}
                </td>
                <td>
                  <Button
                    variant={req.three_way_match_status === "DISCREPANCY" ? "warning" : "primary"}
                    onClick={() => openModal(req.id)}
                    disabled={verifyingIds.includes(req.id)}
                  >
                    {verifyingIds.includes(req.id)
                      ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" className="me-2" />
                          Verifying...
                        </>
                      )
                      : req.three_way_match_status === "DISCREPANCY"
                      ? "Resubmit"
                      : "Submit"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal for file upload */}
      <Modal show={modalRequestId !== null} onHide={() => setModalRequestId(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Upload Receipt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border p-4 text-center"
            style={{ cursor: "pointer", backgroundColor: "#f9f9f9" }}
          >
            {selectedFile ? (
              <p>Selected File: {selectedFile.name}</p>
            ) : (
              <p>Drag & drop a PDF here or click to select</p>
            )}
            <Form.Control type="file" accept="application/pdf" onChange={handleFileSelect} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalRequestId(null)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!selectedFile}>
            {loadingIds.includes(modalRequestId!) ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SubmitReceipts;
