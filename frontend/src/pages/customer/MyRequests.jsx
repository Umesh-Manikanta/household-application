import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyRequests, closeRequest, postReview } from "../../api/customer";
import Navbar from "../../components/Navbar";

const NAV_LINKS = [
    { path: "/customer", label: "Dashboard" },
    { path: "/customer/services", label: "Browse Services" },
    { path: "/customer/requests", label: "My Requests" },
];

const STATUS_COLORS = {
    requested: "#f59e0b",
    assigned: "#0891b2",
    closed: "#10b981",
    rejected: "#dc2626",
};

const MyRequests = () => {
    const queryClient = useQueryClient();
    const [reviewRequest, setReviewRequest] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["my-requests"],
        queryFn: () => getMyRequests().then((r) => r.data.requests),
    });

    const closeMutation = useMutation({
        mutationFn: closeRequest,
        onSuccess: () => {
            queryClient.invalidateQueries(["my-requests"]);
            setSuccess("Request closed successfully.");
            setTimeout(() => setSuccess(""), 3000);
        },
    });

    const reviewMutation = useMutation({
        mutationFn: postReview,
        onSuccess: () => {
            queryClient.invalidateQueries(["my-requests"]);
            setReviewRequest(null);
            setRating(5);
            setComment("");
            setSuccess("Review submitted successfully.");
            setTimeout(() => setSuccess(""), 3000);
        },
        onError: (err) => setError(err.response?.data?.error || "Failed to submit review"),
    });

    const handleReview = (e) => {
        e.preventDefault();
        setError("");
        reviewMutation.mutate({
            service_request_id: reviewRequest.id,
            rating: parseInt(rating),
            comment,
        });
    };

    return (
        <div style={styles.page}>
            <Navbar links={NAV_LINKS} />
            <div style={styles.content}>
                <h1 style={styles.heading}>My Requests</h1>

                {success && <div style={styles.success}>{success}</div>}

                {/* Review form */}
                {reviewRequest && (
                    <div style={styles.reviewCard}>
                        <h2 style={styles.reviewTitle}>Review — {reviewRequest.service_name}</h2>
                        {error && <div style={styles.error}>{error}</div>}
                        <form onSubmit={handleReview}>
                            <div style={styles.field}>
                                <label style={styles.label}>Rating</label>
                                <select
                                    style={styles.select}
                                    value={rating}
                                    onChange={(e) => setRating(e.target.value)}
                                >
                                    {[5, 4, 3, 2, 1].map((r) => (
                                        <option key={r} value={r}>{"★".repeat(r)} ({r}/5)</option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Comment (optional)</label>
                                <textarea
                                    style={styles.textarea}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Share your experience..."
                                />
                            </div>
                            <div style={styles.reviewActions}>
                                <button
                                    type="button"
                                    style={styles.btnCancel}
                                    onClick={() => setReviewRequest(null)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" style={styles.btnSubmit}>
                                    Submit Review
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Requests list */}
                {isLoading ? (
                    <p>Loading requests...</p>
                ) : data?.length === 0 ? (
                    <div style={styles.emptyState}>
                        <p>No requests yet.</p>
                    </div>
                ) : (
                    <div style={styles.list}>
                        {data?.map((req) => (
                            <div key={req.id} style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <div>
                                        <h3 style={styles.cardTitle}>{req.service_name}</h3>
                                        <p style={styles.cardMeta}>
                                            Requested on {new Date(req.date_of_request).toLocaleDateString()}
                                        </p>
                                        {req.professional_name && (
                                            <p style={styles.cardMeta}>Professional: {req.professional_name}</p>
                                        )}
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
                                    {req.status === "assigned" && (
                                        <button
                                            style={styles.btnClose}
                                            onClick={() => closeMutation.mutate(req.id)}
                                        >
                                            Close Request
                                        </button>
                                    )}
                                    {req.status === "closed" && !req.review && (
                                        <button
                                            style={styles.btnReview}
                                            onClick={() => { setReviewRequest(req); setError(""); }}
                                        >
                                            Leave Review
                                        </button>
                                    )}
                                    {req.status === "closed" && req.review && (
                                        <span style={styles.reviewed}>
                                            {"★".repeat(req.review?.rating)} Reviewed
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
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
    reviewCard: {
        backgroundColor: "#fff",
        padding: "24px",
        borderRadius: "10px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        marginBottom: "24px",
        borderLeft: "4px solid #4f46e5",
    },
    reviewTitle: { margin: "0 0 16px 0", fontSize: "18px", color: "#1a1a1a" },
    field: { marginBottom: "16px" },
    label: { display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#333" },
    select: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        fontSize: "14px",
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
    reviewActions: { display: "flex", gap: "12px", justifyContent: "flex-end" },
    btnCancel: {
        padding: "10px 20px",
        backgroundColor: "#f5f5f5",
        color: "#333",
        border: "1px solid #ddd",
        borderRadius: "8px",
        fontSize: "14px",
        cursor: "pointer",
    },
    btnSubmit: {
        padding: "10px 20px",
        backgroundColor: "#4f46e5",
        color: "#fff",
        border: "none",
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
    cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" },
    cardTitle: { margin: "0 0 4px 0", fontSize: "16px", fontWeight: "600", color: "#1a1a1a" },
    cardMeta: { margin: "0 0 2px 0", fontSize: "13px", color: "#666" },
    badge: { padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "500", whiteSpace: "nowrap" },
    cardActions: { display: "flex", gap: "8px" },
    btnClose: {
        padding: "7px 16px",
        backgroundColor: "#fee2e2",
        color: "#dc2626",
        border: "none",
        borderRadius: "6px",
        fontSize: "13px",
        cursor: "pointer",
    },
    btnReview: {
        padding: "7px 16px",
        backgroundColor: "#eff6ff",
        color: "#1d4ed8",
        border: "none",
        borderRadius: "6px",
        fontSize: "13px",
        cursor: "pointer",
    },
    reviewed: { fontSize: "13px", color: "#f59e0b" },
    emptyState: { textAlign: "center", color: "#888", padding: "48px" },
};

export default MyRequests;