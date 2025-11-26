import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function VerifyAccount() {
  const [email, setEmail] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email); // Load email from navigation state
    }
  }, [location]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setIsError(false);
    const apiUrl = import.meta.env.VITE_API_URL;


    try {
      const res = await axios.post(`${apiUrl}/user/verify/`, { email, token });

      if (res.data.success) {
        setMessage("Account verified successfully!");
        navigate("/"); // Redirect to login page after successful verification
      } else {
        setMessage(res.data.message);
        setIsError(true);
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Verification failed");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>Verify Your Account</h2>
        <p style={styles.subtitle}>
          Please verify your account using the token sent to your email: <strong>{email}</strong>
        </p>

        {message && (
          <div style={{ ...styles.alert, ...(isError ? styles.alertError : styles.alertSuccess) }}>
            <span style={styles.alertIcon}>{isError ? "⚠" : "✓"}</span>
            {message}
          </div>
        )}

        <form onSubmit={handleVerify} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Verification Token</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter the verification token"
              required
              style={styles.input}
            />
          </div>

          <button type="submit" style={{ ...styles.button, ...(loading ? styles.buttonLoading : {}) }}>
            {loading ? "Verifying..." : "Verify Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f0f4f8",
    padding: "20px",
  },
  container: {
    maxWidth: "400px",
    width: "100%",
    background: "white",
    borderRadius: "20px",
    padding: "40px 30px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  title: {
    fontSize: "24px",
    margin: "0 0 10px",
    color: "#333",
  },
  subtitle: {
    fontSize: "14px",
    color: "#555",
    margin: "0 0 20px",
    lineHeight: "1.5",
  },
  alert: {
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  alertError: {
    background: "#f8d7da",
    color: "#721c24",
  },
  alertSuccess: {
    background: "#d4edda",
    color: "#155724",
  },
  alertIcon: {
    marginRight: "10px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  inputGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    marginBottom: "5px",
    textAlign: "left",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    background: "#f9f9f9",
    fontSize: "14px",
    outline: "none",
    transition: "border 0.3s",
  },
  button: {
    padding: "14px",
    borderRadius: "8px",
    background: "#667eea",
    color: "white",
    fontSize: "16px",
    border: "none",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  buttonLoading: {
    background: "#5a6abf", // Darker shade when loading
  },
};

// Add the hover effect using JS event handlers if needed
const buttonHoverStyle = {
  background: "#5a6abf",
};