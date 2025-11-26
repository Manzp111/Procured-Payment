import React, { useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/login.css";

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setIsError(false);
   const apiUrl = import.meta.env.VITE_API_URL;
   
    try {
      
      //  const res = await axios.post(`${process.env.REACT_APP_API_URL}/user/login/`, form);
       const res = await axios.post(`${apiUrl}/user/login/`, form);
      

      if (res.data.success) {
        localStorage.setItem("accessToken", res.data.data.access);
        localStorage.setItem("refreshToken", res.data.data.refresh);
        localStorage.setItem("role", res.data.data.role);
       
         setMessage(res.data.message); // Show the success message
          setIsError(false);

        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      } else {
        setMessage(res.data.message);
        setIsError(false);
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Login failed");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper position-relative overflow-hidden min-vh-100 d-flex align-items-center justify-content-center bg-white p-4">
      {/* Background Circles */}
      <div className="bg-circle-1"></div>
      <div className="bg-circle-2"></div>

      <div className="login-container bg-white rounded-4 p-5 shadow-lg position-relative z-1" style={{ maxWidth: "440px", width: "100%" }}>
        {/* Header */}
        <div className="text-center mb-5">
          <div className="d-flex justify-content-center mb-3">
            <div className="login-logo rounded-3 d-flex align-items-center justify-content-center text-white">
              <FaLock size={24} />
            </div>
          </div>
          <h2 className="h3 fw-bold mb-2">Welcome Back to Procured Payment</h2>
          <p className="text-muted mb-0">Sign in to continue to your account</p>
        </div>

        {/* Alert */}
        {message && (
          <Alert
            variant={isError ? "danger" : "success"}
            className="d-flex align-items-center gap-2 mb-4 animate__slideIn animate__animated animate__faster"
          >
            <span>{isError ? "⚠" : "✓"}</span>
            {message}
          </Alert>
        )}

        {/* Form */}
        <Form onSubmit={handleSubmit} className="mb-4">
          {/* Email */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold text-dark">Email Address</Form.Label>
            <div className="input-wrapper position-relative">
              <FaEnvelope className="position-absolute text-muted ms-3" style={{ top: "12px" }} />
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
                className="ps-5"
              />
            </div>
          </Form.Group>

          {/* Password */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold text-dark">Password</Form.Label>
            <div className="input-wrapper position-relative">
              <FaLock className="position-absolute text-muted ms-3" style={{ top: "12px" }} />
              <Form.Control
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                className="ps-5 pe-5"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle position-absolute end-0 me-3 d-flex align-items-center"
                style={{ top: "12px", cursor: "pointer", color: "#9ca3af" }}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </span>
            </div>
          </Form.Group>

          {/* Forgot Password */}
          <div className="text-end mb-4">
            <a href="#" className="text-decoration-none text-primary fw-medium">
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-100 py-3 fw-bold rounded-3 gradient-btn position-relative"
            style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", border: "none", boxShadow: "0 4px 16px rgba(102, 126, 234, 0.4)" }}
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </Form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-muted mb-0">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary fw-bold text-decoration-none">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}