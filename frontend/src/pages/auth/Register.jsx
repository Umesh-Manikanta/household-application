import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../api/auth";

const SERVICES = [
  "AC Repair",
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Carpentry",
  "Painting",
  "Pest Control",
  "Appliance Repair",
];

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    phone: "",
    address: "",
    pincode: "",
    role: "customer",
    service_type: "",
    experience: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await registerUser(form);

      if (form.role === "professional") {
        setSuccess("Registration successful. Please wait for admin approval before logging in.");
      } else {
        setSuccess("Registration successful. Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join Household Services</p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Role selector */}
          <div style={styles.roleRow}>
            <button
              type="button"
              style={form.role === "customer" ? styles.roleActive : styles.roleInactive}
              onClick={() => setForm({ ...form, role: "customer" })}
            >
              Customer
            </button>
            <button
              type="button"
              style={form.role === "professional" ? styles.roleActive : styles.roleInactive}
              onClick={() => setForm({ ...form, role: "professional" })}
            >
              Professional
            </button>
          </div>

          {/* Common fields */}
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input style={styles.input} name="full_name" value={form.full_name}
                onChange={handleChange} placeholder="Full name" required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Username</label>
              <input style={styles.input} name="username" value={form.username}
                onChange={handleChange} placeholder="Username" required />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input style={styles.input} type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="Email" required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input style={styles.input} type="password" name="password" value={form.password}
                onChange={handleChange} placeholder="Password" required />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Phone</label>
              <input style={styles.input} name="phone" value={form.phone}
                onChange={handleChange} placeholder="Phone number" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Pincode</label>
              <input style={styles.input} name="pincode" value={form.pincode}
                onChange={handleChange} placeholder="Pincode" />
            </div>
          </div>

          <div style={styles.fieldFull}>
            <label style={styles.label}>Address</label>
            <input style={styles.input} name="address" value={form.address}
              onChange={handleChange} placeholder="Full address" />
          </div>

          {/* Professional-only fields */}
          {form.role === "professional" && (
            <>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Service Type</label>
                  <select style={styles.input} name="service_type"
                    value={form.service_type} onChange={handleChange} required>
                    <option value="">Select service</option>
                    {SERVICES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Experience (years)</label>
                  <input style={styles.input} type="number" name="experience"
                    value={form.experience} onChange={handleChange}
                    placeholder="Years of experience" required />
                </div>
              </div>

              <div style={styles.fieldFull}>
                <label style={styles.label}>Description</label>
                <textarea style={styles.textarea} name="description"
                  value={form.description} onChange={handleChange}
                  placeholder="Describe your skills and experience" />
              </div>
            </>
          )}

          <button
            style={loading ? styles.buttonDisabled : styles.button}
            type="submit"
            disabled={loading}
          >
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    padding: "24px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "600px",
  },
  title: {
    margin: "0 0 4px 0",
    fontSize: "24px",
    fontWeight: "600",
    color: "#1a1a1a",
    textAlign: "center",
  },
  subtitle: {
    margin: "0 0 24px 0",
    color: "#666",
    textAlign: "center",
    fontSize: "14px",
  },
  error: {
    backgroundColor: "#fff0f0",
    color: "#cc0000",
    padding: "10px 14px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  success: {
    backgroundColor: "#f0fff4",
    color: "#007a33",
    padding: "10px 14px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  roleRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
  },
  roleActive: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  roleInactive: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#f5f5f5",
    color: "#666",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
  },
  row: {
    display: "flex",
    gap: "16px",
    marginBottom: "0px",
  },
  field: {
    flex: 1,
    marginBottom: "16px",
  },
  fieldFull: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    backgroundColor: "#fff",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    minHeight: "80px",
    resize: "vertical",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "8px",
  },
  buttonDisabled: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#a5a3e8",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "not-allowed",
    marginTop: "8px",
  },
  footer: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "14px",
    color: "#666",
  },
  link: {
    color: "#4f46e5",
    textDecoration: "none",
    fontWeight: "500",
  },
};

export default Register;