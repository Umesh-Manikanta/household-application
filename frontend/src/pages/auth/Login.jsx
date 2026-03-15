import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../api/auth";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await loginUser(form);
            const { access_token, user } = res.data;
            login(access_token, user);

            // Redirect based on role
            if (user.role === "admin") navigate("/admin");
            else if (user.role === "customer") navigate("/customer");
            else if (user.role === "professional") navigate("/professional");
        } catch (err) {
            setError(err.response?.data?.error || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Household Services</h2>
                <p style={styles.subtitle}>Sign in to your account</p>

                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label style={styles.label}>Username</label>
                        <input
                            style={styles.input}
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Password</label>
                        <input
                            style={styles.input}
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <button
                        style={loading ? styles.buttonDisabled : styles.button}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p style={styles.footer}>
                    Don't have an account?{" "}
                    <Link to="/register" style={styles.link}>Register here</Link>
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
    },
    card: {
        backgroundColor: "#fff",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "400px",
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
    field: {
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

export default Login;