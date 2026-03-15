import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ links }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav style={styles.nav}>
            <div style={styles.brand}>Household Services</div>
            <div style={styles.links}>
                {links.map((link) => (
                    <Link key={link.path} to={link.path} style={styles.link}>
                        {link.label}
                    </Link>
                ))}
            </div>
            <div style={styles.right}>
                <span style={styles.username}>{user?.full_name}</span>
                <button style={styles.logout} onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
};

const styles = {
    nav: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        height: "60px",
        backgroundColor: "#4f46e5",
        color: "#fff",
    },
    brand: {
        fontWeight: "600",
        fontSize: "18px",
    },
    links: {
        display: "flex",
        gap: "24px",
    },
    link: {
        color: "#fff",
        textDecoration: "none",
        fontSize: "14px",
        opacity: 0.9,
    },
    right: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
    },
    username: {
        fontSize: "14px",
        opacity: 0.9,
    },
    logout: {
        padding: "6px 14px",
        backgroundColor: "transparent",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.5)",
        borderRadius: "6px",
        fontSize: "13px",
        cursor: "pointer",
    },
};

export default Navbar;