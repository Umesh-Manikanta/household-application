import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getServices, createRequest } from "../../api/customer";
import Navbar from "../../components/Navbar";

const NAV_LINKS = [
    { path: "/customer", label: "Dashboard" },
    { path: "/customer/services", label: "Browse Services" },
    { path: "/customer/requests", label: "My Requests" },
];

const SearchServices = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [pincode, setPincode] = useState("");
    const [selectedService, setSelectedService] = useState(null);
    const [preferredDate, setPreferredDate] = useState("");
    const [remarks, setRemarks] = useState("");
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["customer-services", search, pincode],
        queryFn: () => getServices({ search, pincode }).then((r) => r.data.services),
    });

    const requestMutation = useMutation({
        mutationFn: createRequest,
        onSuccess: () => {
            queryClient.invalidateQueries(["my-requests"]);
            setSelectedService(null);
            setPreferredDate("");
            setRemarks("");
            setSuccess("Service request created successfully.");
            setTimeout(() => setSuccess(""), 3000);
        },
        onError: (err) => setError(err.response?.data?.error || "Failed to create request"),
    });

    const handleBook = (e) => {
        e.preventDefault();
        setError("");
        requestMutation.mutate({
            service_id: selectedService.id,
            preferred_date: preferredDate || null,
            remarks: remarks || null,
        });
    };

    return (
        <div style={styles.page}>
            <Navbar links={NAV_LINKS} />
            <div style={styles.content}>
                <h1 style={styles.heading}>Browse Services</h1>

                {/* Search filters */}
                <div style={styles.filters}>
                    <input
                        style={styles.input}
                        placeholder="Search services..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <input
                        style={{ ...styles.input, maxWidth: "160px" }}
                        placeholder="Pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                    />
                </div>

                {success && <div style={styles.success}>{success}</div>}

                {/* Booking form */}
                {selectedService && (
                    <div style={styles.bookingCard}>
                        <h2 style={styles.bookingTitle}>Book — {selectedService.name}</h2>
                        <p style={styles.bookingPrice}>Base price: ₹{selectedService.base_price}</p>
                        {error && <div style={styles.error}>{error}</div>}
                        <form onSubmit={handleBook}>
                            <div style={styles.field}>
                                <label style={styles.label}>Preferred Date (optional)</label>
                                <input
                                    style={styles.input}
                                    type="datetime-local"
                                    value={preferredDate}
                                    onChange={(e) => setPreferredDate(e.target.value)}
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Remarks (optional)</label>
                                <textarea
                                    style={styles.textarea}
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Any specific requirements..."
                                />
                            </div>
                            <div style={styles.bookingActions}>
                                <button
                                    type="button"
                                    style={styles.btnCancel}
                                    onClick={() => setSelectedService(null)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" style={styles.btnBook}>
                                    Confirm Booking
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Services grid */}
                {isLoading ? (
                    <p>Loading services...</p>
                ) : (
                    <div style={styles.grid}>
                        {data?.length === 0 && (
                            <p style={styles.empty}>No services found.</p>
                        )}
                        {data?.map((service) => (
                            <div key={service.id} style={styles.card}>
                                <h3 style={styles.cardTitle}>{service.name}</h3>
                                <p style={styles.cardPrice}>₹{service.base_price}</p>
                                {service.time_required && (
                                    <p style={styles.cardMeta}>{service.time_required} mins</p>
                                )}
                                {service.description && (
                                    <p style={styles.cardDesc}>{service.description}</p>
                                )}
                                {service.professionals_available !== undefined && (
                                    <p style={styles.cardMeta}>
                                        {service.professionals_available} professional(s) in your area
                                    </p>
                                )}
                                <button
                                    style={styles.btnBook}
                                    onClick={() => {
                                        setSelectedService(service);
                                        setError("");
                                    }}
                                >
                                    Book Now
                                </button>
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
    filters: { display: "flex", gap: "12px", marginBottom: "24px" },
    input: {
        flex: 1,
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        fontSize: "14px",
        outline: "none",
        boxSizing: "border-box",
    },
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
    bookingCard: {
        backgroundColor: "#fff",
        padding: "24px",
        borderRadius: "10px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        marginBottom: "24px",
        borderLeft: "4px solid #4f46e5",
    },
    bookingTitle: { margin: "0 0 4px 0", fontSize: "18px", color: "#1a1a1a" },
    bookingPrice: { margin: "0 0 16px 0", color: "#4f46e5", fontWeight: "600" },
    field: { marginBottom: "16px" },
    label: { display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#333" },
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
    bookingActions: { display: "flex", gap: "12px", justifyContent: "flex-end" },
    btnCancel: {
        padding: "10px 20px",
        backgroundColor: "#f5f5f5",
        color: "#333",
        border: "1px solid #ddd",
        borderRadius: "8px",
        fontSize: "14px",
        cursor: "pointer",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "16px",
    },
    card: {
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    },
    cardTitle: { margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600", color: "#1a1a1a" },
    cardPrice: { margin: "0 0 4px 0", fontSize: "20px", fontWeight: "700", color: "#4f46e5" },
    cardMeta: { margin: "0 0 8px 0", fontSize: "13px", color: "#888" },
    cardDesc: { margin: "0 0 16px 0", fontSize: "13px", color: "#555", lineHeight: "1.5" },
    btnBook: {
        width: "100%",
        padding: "10px",
        backgroundColor: "#4f46e5",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        cursor: "pointer",
        fontWeight: "500",
    },
    empty: { color: "#888", fontSize: "14px" },
};

export default SearchServices;