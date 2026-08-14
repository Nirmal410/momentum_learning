import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function AdminRoute({ children }) {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="admin-loading-state">
                <div className="spinner"></div>
                <p>Verifying admin authorization...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (user.role !== "ADMIN") {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
