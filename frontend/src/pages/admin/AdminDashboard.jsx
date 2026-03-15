import { useQuery } from "@tanstack/react-query";
import { getStats } from "../../api/admin";
import Navbar from "../../components/Navbar";

const NAV_LINKS = [
  { path: "/admin", label: "Dashboard" },
  { path: "/admin/users", label: "Users" },
  { path: "/admin/services", label: "Services" },
];

const StatCard = ({ label, value, color }) => (
  <div style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
    <div style={styles.cardValue}>{value}</div>
    <div style={styles.cardLabel}>{label}</div>
  </div>
);

const AdminDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => getStats().then((r) => r.data),
  });

  return (
    <div style={styles.page}>
      <Navbar links={NAV_LINKS} />
      <div style={styles.content}>
        <h1 style={styles.heading}>Dashboard</h1>

        {isLoading ? (
          <p>Loading stats...</p>
        ) : (
          <>
            <h2 style={styles.section}>Users</h2>
            <div style={styles.grid}>
              <StatCard label="Total Customers" value={data?.total_customers} color="#4f46e5" />
              <StatCard label="Total Professionals" value={data?.total_professionals} color="#0891b2" />
              <StatCard label="Pending Approvals" value={data?.pending_approvals} color="#f59e0b" />
            </div>

            <h2 style={styles.section}>Service Requests</h2>
            <div style={styles.grid}>
              <StatCard label="Total Requests" value={data?.total_requests} color="#6366f1" />
              <StatCard label="Open" value={data?.open_requests} color="#f59e0b" />
              <StatCard label="Assigned" value={data?.assigned_requests} color="#0891b2" />
              <StatCard label="Closed" value={data?.closed_requests} color="#10b981" />
            </div>

            <h2 style={styles.section}>Services</h2>
            <div style={styles.grid}>
              <StatCard label="Active Services" value={data?.total_services} color="#10b981" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
  content: { padding: "32px" },
  heading: { margin: "0 0 24px 0", fontSize: "24px", color: "#1a1a1a" },
  section: { margin: "24px 0 16px 0", fontSize: "16px", color: "#444", fontWeight: "500" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "16px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "10px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  cardValue: { fontSize: "32px", fontWeight: "700", color: "#1a1a1a", marginBottom: "6px" },
  cardLabel: { fontSize: "13px", color: "#666" },
};

export default AdminDashboard;