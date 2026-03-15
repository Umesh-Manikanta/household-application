import { useQuery } from "@tanstack/react-query";
import { getMyRequests } from "../../api/customer";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import { Link } from "react-router-dom";

const NAV_LINKS = [
    { path: "/customer", label: "Dashboard" },
    { path: "/customer/services", label: "Browse Services" },
    { path: "/customer/requests", label: "My Requests" },
];

const CustomerDashboard = () => {
    const { user } = useAuth();

    const { data, isLoading } = useQuery({
        queryKey: ["my-requests"],
        queryFn: () => getMyRequests().then((r) => r.data.requests),
    });

    const total = data?.length || 0;
    const open = data?.filter((r) => r.status === "requested").length || 0;
    const assigned = data?.filter((r) => r.status === "assigned").length || 0;
    const closed = data?.filter((r) => r.status === "closed").length || 0;

    return (
        <div style={styles.page}>
            <Navbar links={NAV_LINKS} />
            <div style={styles.content}>
                <h1 style={styles.heading}>Welcome, {user?.full_name}</h1>
                <p style={styles.sub}>Manage your service requests from here.</p>

                {isLoading ? <p>Loading...</p> : (
                    <div style={styles.grid}>
                        <div style={{ ...styles.card, borderTop: "4px solid #4f46e5" }}>
                            <div style={styles.cardValue}>{total}</div>
                            <div style={styles.cardLabel}>Total Requests</div>
                        </div>
                        <div style={{ ...styles.card, borderTop: "4px solid #f59e0b" }}>
                            <div style={styles.cardValue}>{open}</div>
                            <div style={styles.cardLabel}>Open</div>
                        </div>
                        <div style={{ ...styles.card, borderTop: "4px solid #0891b2" }}>
                            <div style={styles.cardValue}>{assigned}</div>
                            <div style={styles.cardLabel}>Assigned</div>
                        </div>
                        <div style={{ ...styles.card, borderTop: "4px solid #10b981" }}>
                            <div style={styles.cardValue}>{closed}</div>
                            <div style={styles.cardLabel}>Closed</div>
                        </div>
                    </div>
                )}

                <div style={styles.actions}>
                    <Link to="/customer/services" style={styles.btnPrimary}>
                        Browse Services
                    </Link>
                    <Link to="/customer/requests" style={styles.btnSecondary}>
                        View My Requests
                    </Link>
                </div>
            </div>
        </div>
    );
};

const styles = {
    page: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
    content: { padding: "32px" },
    heading: { margin: "0 0 8px 0", fontSize: "24px", color: "#1a1a1a" },
    sub: { margin: "0 0 32px 0", color: "#666", fontSize: "15px" },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "16px",
        marginBottom: "32px",
    },
    card: {
        backgroundColor: "#fff",
        padding: "24px",
        borderRadius: "10px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    },
    cardValue: { fontSize: "32px", fontWeight: "700", color: "#1a1a1a", marginBottom: "6px" },
    cardLabel: { fontSize: "13px", color: "#666" },
    actions: { display: "flex", gap: "16px" },
    btnPrimary: {
        padding: "12px 24px",
        backgroundColor: "#4f46e5",
        color: "#fff",
        borderRadius: "8px",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: "500",
    },
    btnSecondary: {
        padding: "12px 24px",
        backgroundColor: "#fff",
        color: "#4f46e5",
        borderRadius: "8px",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: "500",
        border: "1px solid #4f46e5",
    },
};

export default CustomerDashboard;