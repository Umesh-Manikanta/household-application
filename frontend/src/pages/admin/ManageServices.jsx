import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminServices, createService, updateService, deleteService } from "../../api/admin";
import Navbar from "../../components/Navbar";

const NAV_LINKS = [
    { path: "/admin", label: "Dashboard" },
    { path: "/admin/users", label: "Users" },
    { path: "/admin/services", label: "Services" },
];

const EMPTY_FORM = {
    name: "",
    base_price: "",
    time_required: "",
    description: "",
};

const ManageServices = () => {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["admin-services"],
        queryFn: () => getAdminServices().then((r) => r.data.services),
    });

    const createMutation = useMutation({
        mutationFn: createService,
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-services"]);
            resetForm();
        },
        onError: (err) => setError(err.response?.data?.error || "Failed to create service"),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateService(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-services"]);
            resetForm();
        },
        onError: (err) => setError(err.response?.data?.error || "Failed to update service"),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteService,
        onSuccess: () => queryClient.invalidateQueries(["admin-services"]),
    });

    const resetForm = () => {
        setForm(EMPTY_FORM);
        setEditingService(null);
        setShowForm(false);
        setError("");
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setForm({
            name: service.name,
            base_price: service.base_price,
            time_required: service.time_required || "",
            description: service.description || "",
        });
        setShowForm(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        const payload = {
            ...form,
            base_price: parseFloat(form.base_price),
            time_required: form.time_required ? parseInt(form.time_required) : null,
        };
        if (editingService) {
            updateMutation.mutate({ id: editingService.id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    return (
        <div style={styles.page}>
            <Navbar links={NAV_LINKS} />
            <div style={styles.content}>
                <div style={styles.header}>
                    <h1 style={styles.heading}>Manage Services</h1>
                    <button style={styles.btnAdd} onClick={() => { resetForm(); setShowForm(true); }}>
                        + Add Service
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div style={styles.formCard}>
                        <h2 style={styles.formTitle}>
                            {editingService ? "Edit Service" : "New Service"}
                        </h2>
                        {error && <div style={styles.error}>{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div style={styles.row}>
                                <div style={styles.field}>
                                    <label style={styles.label}>Service Name</label>
                                    <input
                                        style={styles.input}
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g. AC Repair"
                                        required
                                    />
                                </div>
                                <div style={styles.field}>
                                    <label style={styles.label}>Base Price (₹)</label>
                                    <input
                                        style={styles.input}
                                        type="number"
                                        value={form.base_price}
                                        onChange={(e) => setForm({ ...form, base_price: e.target.value })}
                                        placeholder="e.g. 500"
                                        required
                                    />
                                </div>
                                <div style={styles.field}>
                                    <label style={styles.label}>Time Required (mins)</label>
                                    <input
                                        style={styles.input}
                                        type="number"
                                        value={form.time_required}
                                        onChange={(e) => setForm({ ...form, time_required: e.target.value })}
                                        placeholder="e.g. 60"
                                    />
                                </div>
                            </div>
                            <div style={styles.fieldFull}>
                                <label style={styles.label}>Description</label>
                                <textarea
                                    style={styles.textarea}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Describe the service..."
                                />
                            </div>
                            <div style={styles.formActions}>
                                <button type="button" style={styles.btnCancel} onClick={resetForm}>
                                    Cancel
                                </button>
                                <button type="submit" style={styles.btnSave}>
                                    {editingService ? "Update Service" : "Create Service"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Services Grid */}
                {isLoading ? (
                    <p>Loading services...</p>
                ) : (
                    <div style={styles.grid}>
                        {data?.length === 0 && (
                            <p style={styles.empty}>No services yet. Add your first service.</p>
                        )}
                        {data?.map((service) => (
                            <div key={service.id} style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <h3 style={styles.cardTitle}>{service.name}</h3>
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor: service.is_active ? "#d1fae5" : "#fee2e2",
                                        color: service.is_active ? "#065f46" : "#dc2626",
                                    }}>
                                        {service.is_active ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <p style={styles.price}>₹{service.base_price}</p>
                                {service.time_required && (
                                    <p style={styles.meta}>{service.time_required} mins</p>
                                )}
                                {service.description && (
                                    <p style={styles.desc}>{service.description}</p>
                                )}
                                <div style={styles.cardActions}>
                                    <button style={styles.btnEdit} onClick={() => handleEdit(service)}>
                                        Edit
                                    </button>
                                    <button
                                        style={styles.btnDelete}
                                        onClick={() => deleteMutation.mutate(service.id)}
                                    >
                                        Deactivate
                                    </button>
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
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
    heading: { margin: 0, fontSize: "24px", color: "#1a1a1a" },
    btnAdd: {
        padding: "10px 20px",
        backgroundColor: "#4f46e5",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        cursor: "pointer",
    },
    formCard: {
        backgroundColor: "#fff",
        padding: "24px",
        borderRadius: "10px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        marginBottom: "24px",
    },
    formTitle: { margin: "0 0 16px 0", fontSize: "18px", color: "#1a1a1a" },
    error: {
        backgroundColor: "#fff0f0",
        color: "#cc0000",
        padding: "10px 14px",
        borderRadius: "8px",
        marginBottom: "16px",
        fontSize: "14px",
    },
    row: { display: "flex", gap: "16px", marginBottom: "0" },
    field: { flex: 1, marginBottom: "16px" },
    fieldFull: { marginBottom: "16px" },
    label: { display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#333" },
    input: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        fontSize: "14px",
        boxSizing: "border-box",
        outline: "none",
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
    formActions: { display: "flex", gap: "12px", justifyContent: "flex-end" },
    btnCancel: {
        padding: "10px 20px",
        backgroundColor: "#f5f5f5",
        color: "#333",
        border: "1px solid #ddd",
        borderRadius: "8px",
        fontSize: "14px",
        cursor: "pointer",
    },
    btnSave: {
        padding: "10px 20px",
        backgroundColor: "#4f46e5",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        cursor: "pointer",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "16px",
    },
    card: {
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    },
    cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
    cardTitle: { margin: 0, fontSize: "16px", fontWeight: "600", color: "#1a1a1a" },
    badge: { padding: "2px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "500" },
    price: { margin: "0 0 4px 0", fontSize: "20px", fontWeight: "700", color: "#4f46e5" },
    meta: { margin: "0 0 8px 0", fontSize: "13px", color: "#888" },
    desc: { margin: "0 0 16px 0", fontSize: "13px", color: "#555", lineHeight: "1.5" },
    cardActions: { display: "flex", gap: "8px" },
    btnEdit: {
        flex: 1,
        padding: "7px",
        backgroundColor: "#eff6ff",
        color: "#1d4ed8",
        border: "none",
        borderRadius: "6px",
        fontSize: "13px",
        cursor: "pointer",
    },
    btnDelete: {
        flex: 1,
        padding: "7px",
        backgroundColor: "#fee2e2",
        color: "#dc2626",
        border: "none",
        borderRadius: "6px",
        fontSize: "13px",
        cursor: "pointer",
    },
    empty: { color: "#888", fontSize: "14px" },
};

export default ManageServices;