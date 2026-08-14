import { useState } from "react";
import { FaUserShield, FaGlobe, FaUsers } from "react-icons/fa";
import MainLayout from "../components/layout/MainLayout";
import PlatformOverview from "../components/admin/PlatformOverview";
import UserManagement from "../components/admin/UserManagement";
import UserAnalyticsDetail from "../components/admin/UserAnalyticsDetail";
import "../styles/admin.css";

export default function Admin() {
    const [activeTab, setActiveTab] = useState("overview"); // "overview" | "users"
    const [selectedUserId, setSelectedUserId] = useState(null);

    const handleSelectUser = (userId) => {
        setSelectedUserId(userId);
    };

    return (
        <MainLayout>
            <div className="admin-container">
                {/* Admin Header */}
                <div className="admin-header">
                    <div className="admin-header-title">
                        <div className="admin-header-icon">
                            <FaUserShield />
                        </div>
                        <div>
                            <h1>Admin Control & Analytics</h1>
                            <p>Monitor platform statistics, manage users, and inspect learning performance.</p>
                        </div>
                    </div>

                    {!selectedUserId && (
                        <div className="admin-tabs">
                            <button
                                className={`admin-tab-btn ${activeTab === "overview" ? "active" : ""}`}
                                onClick={() => {
                                    setActiveTab("overview");
                                    setSelectedUserId(null);
                                }}
                            >
                                <FaGlobe /> Platform Overview
                            </button>
                            <button
                                className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
                                onClick={() => {
                                    setActiveTab("users");
                                    setSelectedUserId(null);
                                }}
                            >
                                <FaUsers /> User Management & Analytics
                            </button>
                        </div>
                    )}
                </div>

                {/* Content Sections */}
                {selectedUserId ? (
                    <UserAnalyticsDetail
                        userId={selectedUserId}
                        onBack={() => setSelectedUserId(null)}
                    />
                ) : activeTab === "overview" ? (
                    <PlatformOverview />
                ) : (
                    <UserManagement onSelectUser={handleSelectUser} />
                )}
            </div>
        </MainLayout>
    );
}
