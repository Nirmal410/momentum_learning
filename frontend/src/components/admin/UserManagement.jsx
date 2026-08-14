import { useState, useEffect } from "react";
import {
    FaSearch, FaFilter, FaEye, FaUserShield, FaUserCheck,
    FaUserSlash, FaTrashAlt, FaFire, FaExclamationTriangle
} from "react-icons/fa";
import {
    getAllUsersSummary, updateUserStatus, updateUserRole, deleteUser
} from "../../api/adminService";

export default function UserManagement({ onSelectUser }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [roleFilter, setRoleFilter] = useState("ALL");

    // Modal state for user deletion
    const [deleteModalUser, setDeleteModalUser] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAllUsersSummary();
            if (res.data && res.data.data) {
                setUsers(res.data.data);
            }
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to fetch registered users.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (user) => {
        const targetStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        try {
            await updateUserStatus(user.id, targetStatus);
            setUsers((prev) =>
                prev.map((u) => (u.id === user.id ? { ...u, status: targetStatus } : u))
            );
        } catch (err) {
            alert(err?.response?.data?.message || "Could not update user status.");
        }
    };

    const handleChangeRole = async (user) => {
        const targetRole = user.role === "ADMIN" ? "USER" : "ADMIN";
        if (window.confirm(`Are you sure you want to change ${user.name}'s role to ${targetRole}?`)) {
            try {
                await updateUserRole(user.id, targetRole);
                setUsers((prev) =>
                    prev.map((u) => (u.id === user.id ? { ...u, role: targetRole } : u))
                );
            } catch (err) {
                alert(err?.response?.data?.message || "Could not update user role.");
            }
        }
    };

    const handleDeleteUserConfirm = async () => {
        if (!deleteModalUser) return;
        try {
            await deleteUser(deleteModalUser.id);
            setUsers((prev) => prev.filter((u) => u.id !== deleteModalUser.id));
            setDeleteModalUser(null);
        } catch (err) {
            alert(err?.response?.data?.message || "Could not delete user.");
        }
    };

    const resetFilters = () => {
        setSearchQuery("");
        setStatusFilter("ALL");
        setRoleFilter("ALL");
    };

    const isFiltered = searchQuery.trim() !== "" || statusFilter !== "ALL" || roleFilter !== "ALL";

    // Summary counters
    const activeCount = users.filter((u) => String(u.status || "ACTIVE").toUpperCase() === "ACTIVE").length;
    const inactiveCount = users.filter((u) => String(u.status || "ACTIVE").toUpperCase() === "INACTIVE").length;
    const adminCount = users.filter((u) => String(u.role || "USER").toUpperCase().includes("ADMIN")).length;
    const userRoleCount = users.filter((u) => !String(u.role || "USER").toUpperCase().includes("ADMIN")).length;

    // Filter & search logic
    const filteredUsers = users.filter((u) => {
        const uName = (u.name || "").toLowerCase();
        const uEmail = (u.email || "").toLowerCase();
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch = !q || uName.includes(q) || uEmail.includes(q);

        const uStatus = String(u.status || "ACTIVE").toUpperCase();
        const matchesStatus =
            statusFilter === "ALL" || uStatus === statusFilter.toUpperCase();

        const uRole = String(u.role || "USER").toUpperCase().replace("ROLE_", "");
        const targetRole = roleFilter.toUpperCase().replace("ROLE_", "");
        const matchesRole =
            roleFilter === "ALL" || uRole === targetRole;

        return matchesSearch && matchesStatus && matchesRole;
    });

    if (loading) {
        return (
            <div className="admin-loading-state" style={{ padding: "3rem", textAlign: "center" }}>
                <div className="spinner"></div>
                <p style={{ marginTop: "1rem", color: "#64748b" }}>Loading registered users...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card" style={{ padding: "2rem", textAlign: "center", color: "#ef4444" }}>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={loadUsers} style={{ marginTop: "1rem" }}>
                    Retry Loading
                </button>
            </div>
        );
    }

    return (
        <div className="user-mgmt-container-box">
            {/* Search & Filter Bar */}
            <div className="user-mgmt-header">
                <div className="search-filter-bar">
                    <div className="admin-search-input">
                        <FaSearch style={{ color: "#94a3b8" }} />
                        <input
                            type="text"
                            placeholder="Search user by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <FaFilter style={{ color: "#64748b" }} />
                        <select
                            className="admin-filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">All Statuses ({users.length})</option>
                            <option value="ACTIVE">Active Users ({activeCount})</option>
                            <option value="INACTIVE">Inactive Users ({inactiveCount})</option>
                        </select>

                        <select
                            className="admin-filter-select"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="ALL">All Roles ({users.length})</option>
                            <option value="USER">User Role ({userRoleCount})</option>
                            <option value="ADMIN">Admin Role ({adminCount})</option>
                        </select>

                        {isFiltered && (
                            <button
                                className="btn-secondary"
                                style={{ padding: "0.55rem 0.9rem", fontSize: "0.85rem" }}
                                onClick={resetFilters}
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="users-table-card">
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Topics</th>
                                <th>Tasks Done</th>
                                <th>Problems Solved</th>
                                <th>Streak</th>
                                <th>Last Active</th>
                                <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar-circle">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="user-cell-name">{user.name}</div>
                                                    <div className="user-cell-email">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <span className={`badge ${user.role === "ADMIN" ? "badge-admin" : "badge-user"}`}>
                                                {user.role === "ADMIN" ? <FaUserShield /> : null} {user.role}
                                            </span>
                                        </td>

                                        <td>
                                            <span className={`badge ${user.status === "ACTIVE" ? "badge-active" : "badge-inactive"}`}>
                                                {user.status === "ACTIVE" ? <FaUserCheck /> : <FaUserSlash />} {user.status}
                                            </span>
                                        </td>

                                        <td><strong>{user.topicCount}</strong></td>

                                        <td>
                                            <strong>{user.completedTasks}</strong> / {user.totalTasks}
                                        </td>

                                        <td>
                                            <strong>{user.problemsSolved}</strong>
                                        </td>

                                        <td>
                                            <span style={{ fontWeight: 700, color: user.currentStreak > 0 ? "#f59e0b" : "#94a3b8" }}>
                                                🔥 {user.currentStreak}
                                            </span>
                                        </td>

                                        <td style={{ fontSize: "0.8rem", color: "#64748b" }}>
                                            {user.lastActive}
                                        </td>

                                        <td style={{ textAlign: "right" }}>
                                            <div className="action-btns" style={{ justifyContent: "flex-end" }}>
                                                <button
                                                    className="action-btn view-btn"
                                                    title="View Detailed User Analytics"
                                                    onClick={() => onSelectUser(user.id)}
                                                >
                                                    <FaEye /> Analytics
                                                </button>

                                                <button
                                                    className="action-btn toggle-btn"
                                                    title={user.status === "ACTIVE" ? "Deactivate User" : "Activate User"}
                                                    onClick={() => handleToggleStatus(user)}
                                                >
                                                    {user.status === "ACTIVE" ? <FaUserSlash /> : <FaUserCheck />}
                                                </button>

                                                <button
                                                    className="action-btn role-btn"
                                                    title="Change Role (Admin/User)"
                                                    onClick={() => handleChangeRole(user)}
                                                >
                                                    <FaUserShield />
                                                </button>

                                                <button
                                                    className="action-btn delete-btn"
                                                    title="Delete User Account"
                                                    onClick={() => setDeleteModalUser(user)}
                                                >
                                                    <FaTrashAlt />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                                        <p style={{ margin: "0 0 1rem 0", fontSize: "1rem" }}>
                                            No users found matching current filters (Status: <strong>{statusFilter}</strong>, Role: <strong>{roleFilter}</strong>).
                                        </p>
                                        {isFiltered && (
                                            <button className="btn btn-primary" onClick={resetFilters}>
                                                Show All Registered Users
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModalUser && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#ef4444" }}>
                            <FaExclamationTriangle /> Delete Account Confirmation
                        </div>
                        <div className="modal-body">
                            Are you sure you want to delete the account for <strong>{deleteModalUser.name}</strong> ({deleteModalUser.email})?
                            <br /><br />
                            This will permanently remove all learning topics, subtopics, and problem solving submissions associated with this user. This action cannot be undone.
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setDeleteModalUser(null)}>
                                Cancel
                            </button>
                            <button className="btn-danger" onClick={handleDeleteUserConfirm}>
                                Yes, Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
