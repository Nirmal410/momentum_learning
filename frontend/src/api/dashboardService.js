import api from "./api";

function unwrap(resp) {
    const { success, message, data } = resp.data;
    if (!success) throw new Error(message || "Dashboard request failed.");
    return data;
}

function normalizeSummary(data) {
    if (!data) return data;
    const s = { ...data };
    if (s.total == null && s.totalTasks != null) s.total = s.totalTasks;
    if (s.totalTasks == null && s.total != null) s.totalTasks = s.total;
    if (s.overdue == null && s.due != null) s.overdue = s.due;
    if (s.due == null && s.overdue != null) s.due = s.overdue;
    return s;
}

export const dashboardService = {
    // GET /api/dashboard/summary -> total/completed/pending/due/upcoming counts
    async getSummary() {
        const resp = await api.get("/dashboard/summary");
        return normalizeSummary(unwrap(resp));
    },

    // GET /api/dashboard/calendar -> { byDeadline: {'YYYY-MM-DD': count}, byLeetcode: {'YYYY-MM-DD': count} }
    async getCalendar(year, month) {
        const resp = await api.get("/dashboard/calendar", {
            params: { year, month }
        });
        return unwrap(resp);
    },

    // GET /api/dashboard/recent -> recent activity items
    async getRecentActivity() {
        const resp = await api.get("/dashboard/recent");
        return unwrap(resp);
    }
};

export default dashboardService;