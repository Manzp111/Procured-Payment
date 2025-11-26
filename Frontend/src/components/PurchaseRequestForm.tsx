import React, { useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { FaFilePdf } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function PurchaseRequestForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [proforma, setProforma] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!proforma || proforma.size > 5 * 1024 * 1024) {  // Check for file size (max 5MB)
      setMessage("File must be a PDF and less than 5 MB.");
      setIsError(true);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("amount", amount);
    formData.append("proforma", proforma);

    setLoading(true);
    setMessage(null);
    setIsError(false);
    
    const apiUrl = import.meta.env.VITE_API_URL; //variable to get API URL from .env file

    try {
      const res = await axios.post(`${apiUrl}/api/requests/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (res.data.success) {
        setMessage(res.data.message);
        setIsError(false);
        navigate("/dashboard/my-requests"); // Redirect to My Requests page
        
      } else {
        setMessage(res.data.message);
        setIsError(true);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setMessage(err.response.data.message || "Submission failed");
      } else {
        setMessage("An unknown error occurred");
      }
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setProforma(file);
  };

  return (
    <div className="purchase-request-wrapper bg-white p-5 rounded shadow-lg">
      <h2 className="text-center mb-4">Submit Purchase Request</h2>

      {message && (
        <Alert variant={isError ? "danger" : "success"}>
          {message}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formTitle" className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Enter the title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required 
          />
        </Form.Group>

        <Form.Group controlId="formDescription" className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3} 
            placeholder="Enter a brief description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required 
          />
        </Form.Group>

        <Form.Group controlId="formAmount" className="mb-3">
          <Form.Label>Amount</Form.Label>
          <Form.Control 
            type="number" 
            placeholder="Enter the amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required 
          />
        </Form.Group>

        <Form.Group controlId="formProforma" className="mb-3">
          <Form.Label>
            Proforma Invoice <FaFilePdf className="text-danger" />
          </Form.Label>
          <Form.Control 
            type="file" 
            accept="application/pdf"
            onChange={handleFileChange} 
            required 
          />
          <Form.Text muted>
            Maximum size: 5 MB
          </Form.Text>
        </Form.Group>

        <Button type="submit" variant="" className="w-100 bg-secondary" disabled={loading}>
          {loading ? <><Spinner as="span" animation="border" size="sm" /> Submitting...</> : "Submit Request"}
        </Button>
      </Form>
    </div>
  );
}