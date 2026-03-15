import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUsers, approveUser, blockUser, unblockUser } from "../../api/admin";
import Navbar from "../../components/Navbar";

const NAV_LINKS = [
    { path: "/admin", label: "Dashboard" },
    { path: "/admin/users", label: "Users" },
    { path: "/admin/services", label: "Services" },
];

const Badge = ({ text, color }) => (
    <span style={{
        padding: "2px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "500",
        backgroundColor: color + "20",
        color: color,
    }}>
        {text}
    </span>
);

const ManageUsers = () => {
    const queryClient = useQueryClient();
    const [role, setRole] = useState("");
    const [search, setSearch] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["admin-users", role, search],
        queryFn: () => getAllUsers({ role, search }).then((r) => r.data.users),
    });

    const approveMutation = useMutation({
        mutationFn: approveUser,
        onSuccess: () => queryClient.invalidateQueries(["admin-users"]),
    });

    const blockMutation = useMutation({
        mutationFn: blockUser,
        onSuccess: () => queryClient.invalidateQueries(["admin-users"]),
    });

    const unblockMutation = useMutation({
        mutationFn: unblockUser,
        onSuccess: () => queryClient.invalidateQueries(["admin-users"]),
    });

    return (
        <div style={styles.page}>
            <Navbar links={NAV_LINKS} />
            <div style={styles.content}>
                <h1 style={styles.heading}>Manage Users</h1>

                {/* Filters */}
                <div style={styles.filters}>
                    <input
                        style={styles.search}
                        placeholder="Search by name, username, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select style={styles.select} value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="">All roles</option>
                        <option value="customer">Customers</option>
                        <option value="professional">Professionals</option>
                    </select>
                </div>

                {/* Table */}
                {isLoading ? (
                    <p>Loading users...</p>
                ) : (
                    <div style={styles.tableWrap}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thead}>
                                    <th style={styles.th}>Name</th>
                                    <th style={styles.th}>Username</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Role</th>
                                    <th style={styles.th}>Service</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.length === 0 && (
                                    <tr>
                                        <td colSpan={7} style={styles.empty}>No users found</td>
                                    </tr>
                                )}
                                {data?.map((user) => (
                                    <tr key={user.id} style={styles.tr}>
                                        <td style={styles.td}>{user.full_name}</td>
                                        <td style={styles.td}>{user.username}</td>
                                        <td style={styles.td}>{user.email}</td>
                                        <td style={styles.td}>
                                            <Badge
                                                text={user.role}
                                                color={user.role === "customer" ? "#0891b2" : "#7c3aed"}
                                            />
                                        </td>
                                        <td style={styles.td}>{user.service_type || "—"}</td>
                                        <td style={styles.td}>
                                            {user.is_blocked ? (
                                                <Badge text="Blocked" color="#dc2626" />
                                            ) : user.role === "professional" && !user.is_approved ? (
                                                <Badge text="Pending" color="#f59e0b" />
                                            ) : (
                                                <Badge text="Active" color="#10b981" />
                                            )}
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.actions}>
                                                {user.role === "professional" && !user.is_approved && !user.is_blocked && (
                                                    <button
                                                        style={styles.btnApprove}
                                                        onClick={() => approveMutation.mutate(user.id)}
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                {!user.is_blocked ? (
                                                    <button
                                                        style={styles.btnBlock}
                                                        onClick={() => blockMutation.mutate(user.id)}
                                                    >
                                                        Block
                                                    </button>
                                                ) : (
                                                    <button
                                                        style={styles.btnUnblock}
                                                        onClick={() => unblockMutation.mutate(user.id)}
                                                    >
                                                        Unblock
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    page: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
    content: { padding: "32px" },
    heading: { margin: "0 0 24px 0", fontSize: "24px", color: "#1a1a1a" },
    filters: { display: "flex", gap: "12px", marginBottom: "20px" },
    search: {
        flex: 1,
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        fontSize: "14px",
        outline: "none",
    },
    select: {
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        fontSize: "14px",
        outline: "none",
        backgroundColor: "#fff",
    },
    tableWrap: {
        backgroundColor: "#fff",
        borderRadius: "10px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        overflow: "hidden",
    },
    table: { width: "100%", borderCollapse: "collapse" },
    thead: { backgroundColor: "#f9fafb" },
    th: {
        padding: "12px 16px",
        textAlign: "left",
        fontSize: "13px",
        fontWeight: "600",
        color: "#555",
        borderBottom: "1px solid #eee",
    },
    tr: { borderBottom: "1px solid #f0f0f0" },
    td: { padding: "12px 16px", fontSize: "14px", color: "#333" },
    empty: { padding: "24px", textAlign: "center", color: "#888" },
    actions: { display: "flex", gap: "8px" },
    btnApprove: {
        padding: "5px 12px",
        backgroundColor: "#10b981",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        fontSize: "12px",
        cursor: "pointer",
    },
    btnBlock: {
        padding: "5px 12px",
        backgroundColor: "#fee2e2",
        color: "#dc2626",
        border: "none",
        borderRadius: "6px",
        fontSize: "12px",
        cursor: "pointer",
    },
    btnUnblock: {
        padding: "5px 12px",
        backgroundColor: "#d1fae5",
        color: "#065f46",
        border: "none",
        borderRadius: "6px",
        fontSize: "12px",
        cursor: "pointer",
    },
};

export default ManageUsers;