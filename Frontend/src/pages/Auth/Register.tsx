import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Importing icons
import { Link,useNavigate } from "react-router-dom";


interface RegisterForm {
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  password: string;
  password2: string;
  profile_picture: File | null;
}

interface PasswordCriteria {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  digit: boolean;
  special: boolean;
  personalInfo: string[];
}

export default function Register() {
  const [form, setForm] = useState<RegisterForm>({
    email: "",
    phone: "",
    first_name: "",
    last_name: "",
    password: "",
    password2: "",
    profile_picture: null,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const [passwordCriteria, setPasswordCriteria] = useState<PasswordCriteria>({
    length: false,
    uppercase: false,
    lowercase: false,
    digit: false,
    special: false,
    personalInfo: [],
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password2Visible, setPassword2Visible] = useState(false);
  

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (e.target.name === "password") {
      checkPasswordCriteria(e.target.value);
    }
    if (e.target.name === "password2") {
      setErrors(form.password !== e.target.value ? "Passwords do not match" : null);
    }
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, profile_picture: e.target.files[0] });
    }
  };

  const checkPasswordCriteria = (password: string) => {
    const { email, phone, first_name, last_name } = form;
    const personalIssues: string[] = [];
    if (email && password.toLowerCase().includes(email.toLowerCase())) personalIssues.push("email");
    if (phone && password.toLowerCase().includes(phone.toLowerCase())) personalIssues.push("phone");
    if (first_name && password.toLowerCase().includes(first_name.toLowerCase())) personalIssues.push("first name");
    if (last_name && password.toLowerCase().includes(last_name.toLowerCase())) personalIssues.push("last name");

    setPasswordCriteria({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digit: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      personalInfo: personalIssues,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors(null);
    setSuccess(null);

    if (form.password !== form.password2) {
      setErrors("Passwords do not match");
      return;
    }

    const allCriteriaMet =
      passwordCriteria.length &&
      passwordCriteria.uppercase &&
      passwordCriteria.lowercase &&
      passwordCriteria.digit &&
      passwordCriteria.special &&
      passwordCriteria.personalInfo.length === 0;

    if (!allCriteriaMet) {
      setErrors("Password does not meet all required criteria");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, (form as any)[key]);
    });
    const apiUrl = import.meta.env.VITE_API_URL;


    try {
      await axios.post(`${apiUrl}/user/register/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Account created successfully! Check your email to verify.");
      setForm({
        email: "",
        phone: "",
        first_name: "",
        last_name: "",
        password: "",
        password2: "",
        profile_picture: null,
      });
      setPasswordCriteria({
        length: false,
        uppercase: false,
        lowercase: false,
        digit: false,
        special: false,
        personalInfo: [],
      });
       setTimeout(() => {
        
        navigate("/verify", { state: { email: form.email } });
      }, 500);
    } catch (err: any) {
      setErrors(err.response?.data.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const renderCriteria = (label: string, valid: boolean) => (
    <li style={{ color: valid ? "green" : "red" }}>{valid ? "✔" : "✖"} {label}</li>
  );

  const renderPersonalInfo = (fields: string[]) =>
    fields.length === 0 ? (
      <li style={{ color: "green" }}>Does not include personal info</li>
    ) : (
      fields.map((f) => (
        <li key={f} style={{ color: "red" }}>✖ Includes your {f}</li>
      ))
    );

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Create Account</h2>

      {errors && <div style={styles.errorBox}><p>{errors}</p></div>}
      {success && <div style={styles.successBox}>{success}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required style={styles.input} />
        <input type="text" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required style={styles.input} />
        <input type="text" name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} required style={styles.input} />
        <input type="text" name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} required style={styles.input} />
        
        <div style={styles.passwordContainer}>
          <input
            type={passwordVisible ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <span onClick={() => setPasswordVisible(!passwordVisible)} style={styles.eyeIcon}>
            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div style={styles.passwordContainer}>
          <input
            type={password2Visible ? "text" : "password"}
            name="password2"
            placeholder="Confirm Password"
            value={form.password2}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <span onClick={() => setPassword2Visible(!password2Visible)} style={styles.eyeIcon}>
            {password2Visible ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <ul style={styles.criteriaList}>
          {renderCriteria("At least 8 characters", passwordCriteria.length)}
          {renderCriteria("Contains uppercase letter", passwordCriteria.uppercase)}
          {renderCriteria("Contains lowercase letter", passwordCriteria.lowercase)}
          {renderCriteria("Contains a number", passwordCriteria.digit)}
          {renderCriteria("Contains special character", passwordCriteria.special)}
          {renderPersonalInfo(passwordCriteria.personalInfo)}
        </ul>

        <label style={styles.label}>Profile Picture:</label>
        <input type="file" name="profile_picture" accept="image/*" onChange={handleFile} style={styles.fileInput} />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
        
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "420px",
    margin: "40px auto",
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
  },
  title: { textAlign: "center", marginBottom: "20px" },
  input: { width: "100%", padding: "12px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "15px" },
  passwordContainer: { position: "relative" },
  eyeIcon: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: "20px",
    color: "#007bff",
  },
  fileInput: { marginBottom: "15px" },
  button: { width: "100%", padding: "12px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", fontSize: "16px", border: "none", borderRadius: "8px", cursor: "pointer" },
  errorBox: { background: "#ffe6e6", color: "#b30000", padding: "10px", marginBottom: "15px", borderRadius: "8px", fontSize: "14px" },
  successBox: { background: "#e6ffe6", color: "#008000", padding: "10px", marginBottom: "15px", borderRadius: "8px", fontSize: "14px" },
  form: { display: "flex", flexDirection: "column" },
  label: { marginBottom: "5px", fontWeight: "bold" },
  criteriaList: { listStyleType: "none", padding: "0", marginBottom: "15px", fontSize: "14px" },
};