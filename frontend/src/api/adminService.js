import api from "./api";

export const getPlatformOverview = async () => {
    return await api.get("/admin/overview");
};

export const getAllUsersSummary = async () => {
    return await api.get("/admin/users");
};

export const getUserAnalytics = async (userId, timeRange = "30d") => {
    return await api.get(`/admin/users/${userId}/analytics?timeRange=${encodeURIComponent(timeRange)}`);
};

export const updateUserStatus = async (userId, status) => {
    return await api.patch(`/admin/users/${userId}/status`, { status });
};

export const updateUserRole = async (userId, role) => {
    return await api.patch(`/admin/users/${userId}/role`, { role });
};

export const deleteUser = async (userId) => {
    return await api.delete(`/admin/users/${userId}`);
};
