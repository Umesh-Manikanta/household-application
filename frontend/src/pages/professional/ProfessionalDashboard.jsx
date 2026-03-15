import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfessionalRequests, acceptRequest, rejectRequest, getProfile } from "../../api/professional";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";

const NAV_LINKS = [
    { path: "/professional", label: "Dashboard" },
];

const STATUS_COLORS = {
    requested: "#f59e0b",
    assigned: "#0891b2",
    closed: "#10b981",
    rejected: "#dc2626",
};

const ProfessionalDashboard = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("available");
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["professional-requests"],
        queryFn: () => getProfessionalRequests().then((r) => r.data),
    });

    const { data: profileData } = useQuery({
        queryKey: ["professional-profile"],
        queryFn: () => getProfile().then((r) => r.data),
    });

    const acceptMutation = useMutation({
        mutationFn: acceptRequest,
        onSuccess: () => {
            queryClient.invalidateQueries(["professional-requests"]);
            setSuccess("Request accepted successfully.");
            setTimeout(() => setSuccess(""), 3000);
        },
        onError: (err) => {
            setError(err.response?.data?.error || "Failed to accept request");
            setTimeout(() => setError(""), 3000);
        },
    });

    const rejectMutation = useMutation({
        mutationFn: rejectRequest,
        onSuccess: () => {
            queryClient.invalidateQueries(["professional-requests"]);
            setSuccess("Request rejected.");
            setTimeout(() => setSuccess(""), 3000);
        },
        onError: (err) => {
            setError(err.response?.data?.error || "Failed to reject request");
            setTimeout(() => setError(""), 3000);
        },
    });

    const available = data?.available_requests || [];
    const myRequests = data?.my_requests || [];
    const assigned = myRequests.filter((r) => r.status === "assigned");
    const closed = myRequests.filter((r) => r.status === "closed");

    return (
        <div style={styles.page}>
            <Navbar links={NAV_LINKS} />
            <div style={styles.content}>

                {/* Profile summary */}
                <div style={styles.profileCard}>
                    <div>
                        <h1 style={styles.name}>{user?.full_name}</h1>
                        <p style={styles.meta}>{user?.service_type} · {user?.experience} years experience</p>
                    </div>
                    <div style={styles.ratingBox}>
                        <span style={styles.ratingValue}>
                            {profileData?.avg_rating > 0 ? `★ ${profileData?.avg_rating}` : "No ratings yet"}
                        </span>
                        <span style={styles.ratingLabel}>
                            {profileData?.reviews?.length || 0} review(s)
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div style={styles.grid}>
                    <div style={{ ...styles.statCard, borderTop: "4px solid #f59e0b" }}>
                        <div style={styles.statValue}>{available.length}</div>
                        <div style={styles.statLabel}>Available Requests</div>
                    </div>
                    <div style={{ ...styles.statCard, borderTop: "4px solid #0891b2" }}>
                        <div style={styles.statValue}>{assigned.length}</div>
                        <div style={styles.statLabel}>Assigned to Me</div>
                    </div>
                    <div style={{ ...styles.statCard, borderTop: "4px solid #10b981" }}>
                        <div style={styles.statValue}>{closed.length}</div>
                        <div style={styles.statLabel}>Completed</div>
                    </div>
                </div>

                {success && <div style={styles.success}>{success}</div>}
                {error && <div style={styles.error}>{error}</div>}

                {/* Tabs */}
                <div style={styles.tabs}>
                    <button
                        style={activeTab === "available" ? styles.tabActive : styles.tabInactive}
                        onClick={() => setActiveTab("available")}
                    >
                        Available Requests ({available.length})
                    </button>
                    <button
                        style={activeTab === "assigned" ? styles.tabActive : styles.tabInactive}
                        onClick={() => setActiveTab("assigned")}
                    >
                        My Assignments ({assigned.length})
                    </button>
                    <button
                        style={activeTab === "closed" ? styles.tabActive : styles.tabInactive}
                        onClick={() => setActiveTab("closed")}
                    >
                        Completed ({closed.length})
                    </button>
                    <button
                        style={activeTab === "reviews" ? styles.tabActive : styles.tabInactive}
                        onClick={() => setActiveTab("reviews")}
                    >
                        Reviews ({profileData?.reviews?.length || 0})
                    </button>
                </div>

                {/* Tab content */}
                {isLoading ? (
                    <p>Loading...</p>
                ) : (
                    <div style={styles.list}>

                        {/* Available requests */}
                        {activeTab === "available" && (
                            available.length === 0 ? (
                                <div style={styles.empty}>No available requests right now.</div>
                            ) : (
                                available.map((req) => (
                                    <div key={req.id} style={styles.card}>
                                        <div style={styles.cardHeader}>
                                            <div>
                                                <h3 style={styles.cardTitle}>{req.service_name}</h3>
                                                <p style={styles.cardMeta}>
                                                    Customer: {req.customer_name}
                                                </p>
                                                <p style={styles.cardMeta}>
                                                    Requested: {new Date(req.date_of_request).toLocaleDateString()}
                                                </p>
                                                {req.preferred_date && (
                                                    <p style={styles.cardMeta}>
                                                        Preferred: {new Date(req.preferred_date).toLocaleString()}
                                                    </p>
                                                )}
                                                {req.remarks && (
                                                    <p style={styles.cardMeta}>Remarks: {req.remarks}</p>
                                                )}
                                            </div>
                                            <span style={{
                                                ...styles.badge,
                                                backgroundColor: STATUS_COLORS[req.status] + "20",
                                                color: STATUS_COLORS[req.status],
                                            }}>
                                                {req.status}
                                            </span>
                                        </div>
                                        <div style={styles.cardActions}>
                                            <button
                                                style={styles.btnAccept}
                                                onClick={() => acceptMutation.mutate(req.id)}
                                            >
                                                Accept
                                            </button>
                                            <button
                                                style={styles.btnReject}
                                                onClick={() => rejectMutation.mutate(req.id)}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )
                        )}

                        {/* Assigned requests */}
                        {activeTab === "assigned" && (
                            assigned.length === 0 ? (
                                <div style={styles.empty}>No assigned requests.</div>
                            ) : (
                                assigned.map((req) => (
                                    <div key={req.id} style={styles.card}>
                                        <div style={styles.cardHeader}>
                                            <div>
                                                <h3 style={styles.cardTitle}>{req.service_name}</h3>
                                                <p style={styles.cardMeta}>Customer: {req.customer_name}</p>
                                                <p style={styles.cardMeta}>
                                                    Requested: {new Date(req.date_of_request).toLocaleDateString()}
                                                </p>
                                                {req.preferred_date && (
                                                    <p style={styles.cardMeta}>
                                                        Preferred: {new Date(req.preferred_date).toLocaleString()}
                                                    </p>
                                                )}
                                                {req.remarks && (
                                                    <p style={styles.cardMeta}>Remarks: {req.remarks}</p>
                                                )}
                                            </div>
                                            <span style={{
                                                ...styles.badge,
                                                backgroundColor: STATUS_COLORS[req.status] + "20",
                                                color: STATUS_COLORS[req.status],
                                            }}>
                                                {req.status}
                                            </span>
                                        </div>
                                        <p style={styles.hint}>
                                            Waiting for customer to close this request.
                                        </p>
                                    </div>
                                ))
                            )
                        )}

                        {/* Closed requests */}
                        {activeTab === "closed" && (
                            closed.length === 0 ? (
                                <div style={styles.empty}>No completed requests yet.</div>
                            ) : (
                                closed.map((req) => (
                                    <div key={req.id} style={styles.card}>
                                        <div style={styles.cardHeader}>
                                            <div>
                                                <h3 style={styles.cardTitle}>{req.service_name}</h3>
                                                <p style={styles.cardMeta}>Customer: {req.customer_name}</p>
                                                <p style={styles.cardMeta}>
                                                    Completed: {new Date(req.date_of_completion).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span style={{
                                                ...styles.badge,
                                                backgroundColor: STATUS_COLORS[req.status] + "20",
                                                color: STATUS_COLORS[req.status],
                                            }}>
                                                {req.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )
                        )}

                        {/* Reviews */}
                        {activeTab === "reviews" && (
                            !profileData?.reviews?.length ? (
                                <div style={styles.empty}>No reviews yet.</div>
                            ) : (
                                profileData.reviews.map((review) => (
                                    <div key={review.id} style={styles.card}>
                                        <div style={styles.reviewHeader}>
                                            <span style={styles.stars}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                                            <span style={styles.reviewDate}>
                                                {new Date(review.date_posted).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {review.comment && (
                                            <p style={styles.reviewComment}>{review.comment}</p>
                                        )}
                                    </div>
                                ))
                            )
                        )}

                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    page: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
    content: { padding: "32px" },
    profileCard: {
        backgroundColor: "#fff",
        padding: "24px",
        borderRadius: "10px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        marginBottom: "24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    name: { margin: "0 0 4px 0", fontSize: "22px", color: "#1a1a1a" },
    meta: { margin: 0, fontSize: "14px", color: "#666" },
    ratingBox: { textAlign: "right" },
    ratingValue: { display: "block", fontSize: "20px", fontWeight: "700", color: "#f59e0b" },
    ratingLabel: { fontSize: "12px", color: "#888" },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "16px",
        marginBottom: "24px",
    },
    statCard: {
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    },
    statValue: { fontSize: "28px", fontWeight: "700", color: "#1a1a1a", marginBottom: "4px" },
    statLabel: { fontSize: "13px", color: "#666" },
    success: {
        backgroundColor: "#f0fff4",
        color: "#007a33",
        padding: "10px 14px",
        borderRadius: "8px",
        marginBottom: "16px",
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
    tabs: { display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" },
    tabActive: {
        padding: "8px 18px",
        backgroundColor: "#4f46e5",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        cursor: "pointer",
        fontWeight: "500",
    },
    tabInactive: {
        padding: "8px 18px",
        backgroundColor: "#fff",
        color: "#555",
        border: "1px solid #ddd",
        borderRadius: "8px",
        fontSize: "14px",
        cursor: "pointer",
    },
    list: { display: "flex", flexDirection: "column", gap: "16px" },
    card: {
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "12px",
    },
    cardTitle: { margin: "0 0 4px 0", fontSize: "16px", fontWeight: "600", color: "#1a1a1a" },
    cardMeta: { margin: "0 0 2px 0", fontSize: "13px", color: "#666" },
    badge: {
        padding: "4px 12px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "500",
        whiteSpace: "nowrap",
    },
    cardActions: { display: "flex", gap: "8px" },
    btnAccept: {
        padding: "7px 20px",
        backgroundColor: "#d1fae5",
        color: "#065f46",
        border: "none",
        borderRadius: "6px",
        fontSize: "13px",
        cursor: "pointer",
        fontWeight: "500",
    },
    btnReject: {
        padding: "7px 20px",
        backgroundColor: "#fee2e2",
        color: "#dc2626",
        border: "none",
        borderRadius: "6px",
        fontSize: "13px",
        cursor: "pointer",
    },
    hint: { margin: 0, fontSize: "13px", color: "#888", fontStyle: "italic" },
    reviewHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px",
    },
    stars: { fontSize: "16px", color: "#f59e0b" },
    reviewDate: { fontSize: "12px", color: "#888" },
    reviewComment: { margin: 0, fontSize: "14px", color: "#444", lineHeight: "1.5" },
    empty: {
        textAlign: "center",
        color: "#888",
        padding: "48px",
        backgroundColor: "#fff",
        borderRadius: "10px",
    },
};

export default ProfessionalDashboard;