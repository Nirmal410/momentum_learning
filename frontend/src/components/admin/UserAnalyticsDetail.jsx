import { useState, useEffect, useCallback } from "react";
import {
    FaArrowLeft, FaCheckCircle, FaClock, FaExclamationCircle,
    FaFire, FaTrophy, FaCalendarCheck, FaCode, FaLock,
    FaChartPie, FaChartLine, FaChartBar
} from "react-icons/fa";
import {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    BarChart, Bar, AreaChart, Area
} from "recharts";
import { getUserAnalytics } from "../../api/adminService";

const TIME_RANGES = [
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
    { label: "3 Months", value: "3m" },
    { label: "6 Months", value: "6m" },
    { label: "1 Year", value: "1y" },
    { label: "All Time", value: "all" },
];

export default function UserAnalyticsDetail({ userId, onBack }) {
    const [analytics, setAnalytics] = useState(null);
    const [timeRange, setTimeRange] = useState("30d");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadAnalytics = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getUserAnalytics(userId, timeRange);
            if (res.data && res.data.data) {
                setAnalytics(res.data.data);
            }
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load user analytics.");
        } finally {
            setLoading(false);
        }
    }, [userId, timeRange]);

    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    if (loading) {
        return (
            <div className="admin-loading-state" style={{ padding: "4rem", textAlign: "center" }}>
                <div className="spinner"></div>
                <p style={{ marginTop: "1rem", color: "#64748b" }}>Fetching detailed user analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card" style={{ padding: "2rem", textAlign: "center", color: "#ef4444" }}>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={onBack} style={{ marginTop: "1rem" }}>
                    Back to User List
                </button>
            </div>
        );
    }

    if (!analytics) return null;

    return (
        <div>
            {/* Top Bar: Back Button & Time Range Filter */}
            <div className="analytics-top-bar">
                <button className="back-to-users-btn" onClick={onBack}>
                    <FaArrowLeft /> Back to User List
                </button>

                <div className="time-filter-pills">
                    {TIME_RANGES.map((t) => (
                        <button
                            key={t.value}
                            className={`time-pill-btn ${timeRange === t.value ? "active" : ""}`}
                            onClick={() => setTimeRange(t.value)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* User Profile Header Card */}
            <div className="user-profile-summary-header">
                <div className="user-summary-details">
                    <div className="user-summary-avatar">
                        {analytics.userName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-summary-meta">
                        <h2>{analytics.userName}</h2>
                        <p>{analytics.userEmail} &bull; Role: <strong>{analytics.userRole}</strong> &bull; Status: <strong>{analytics.userStatus}</strong></p>
                    </div>
                </div>

                <div className="read-only-banner">
                    <FaLock /> Admin Read-Only Mode (Learning data protected)
                </div>
            </div>

            {/* Metric Summary Cards Grid */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-info">
                        <label>Total Tasks</label>
                        <div className="admin-stat-number">{analytics.totalTasks}</div>
                        <div className="admin-stat-subtitle">All subtopics created</div>
                    </div>
                    <div className="admin-stat-icon icon-blue">
                        <FaChartBar />
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-info">
                        <label>Completed Tasks</label>
                        <div className="admin-stat-number">{analytics.completedTasks}</div>
                        <div className="admin-stat-subtitle">Successfully completed</div>
                    </div>
                    <div className="admin-stat-icon icon-green">
                        <FaCheckCircle />
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-info">
                        <label>Pending Tasks</label>
                        <div className="admin-stat-number">{analytics.pendingTasks}</div>
                        <div className="admin-stat-subtitle">In-progress learning</div>
                    </div>
                    <div className="admin-stat-icon icon-orange">
                        <FaClock />
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-info">
                        <label>Due Tasks</label>
                        <div className="admin-stat-number">{analytics.dueTasks}</div>
                        <div className="admin-stat-subtitle">Past deadline</div>
                    </div>
                    <div className="admin-stat-icon icon-rose">
                        <FaExclamationCircle />
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-info">
                        <label>Completion Rate</label>
                        <div className="admin-stat-number">{analytics.completionPercentage}%</div>
                        <div className="admin-stat-subtitle">Task completion ratio</div>
                    </div>
                    <div className="admin-stat-icon icon-indigo">
                        <FaChartPie />
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-info">
                        <label>Current Streak</label>
                        <div className="admin-stat-number">{analytics.currentStreak} <span style={{ fontSize: "1rem" }}>days</span></div>
                        <div className="admin-stat-subtitle">Consecutive activity</div>
                    </div>
                    <div className="admin-stat-icon icon-amber">
                        <FaFire />
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-info">
                        <label>Best Streak</label>
                        <div className="admin-stat-number">{analytics.bestStreak} <span style={{ fontSize: "1rem" }}>days</span></div>
                        <div className="admin-stat-subtitle">All-time record</div>
                    </div>
                    <div className="admin-stat-icon icon-purple">
                        <FaTrophy />
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-info">
                        <label>Active Days</label>
                        <div className="admin-stat-number">{analytics.activeLearningDays}</div>
                        <div className="admin-stat-subtitle">Days with activity</div>
                    </div>
                    <div className="admin-stat-icon icon-cyan">
                        <FaCalendarCheck />
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-info">
                        <label>Problems Solved</label>
                        <div className="admin-stat-number">{analytics.totalProblemsSolved}</div>
                        <div className="admin-stat-subtitle">Coding solutions</div>
                    </div>
                    <div className="admin-stat-icon icon-orange">
                        <FaCode />
                    </div>
                </div>
            </div>

            {/* 8 Interactive Recharts Grid */}
            <div className="admin-charts-grid">
                {/* 1. Doughnut Chart: Completed vs Pending vs Due */}
                <div className="chart-card col-span-4">
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">📊 Task Status Breakdown</div>
                            <div className="chart-subtitle">Completed vs Pending vs Due</div>
                        </div>
                    </div>
                    <div style={{ width: "100%", height: 260 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={analytics.taskStatusDistribution || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {(analytics.taskStatusDistribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Line Chart: Daily Learning Activity */}
                <div className="chart-card col-span-8">
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">📈 Daily Learning Activity</div>
                            <div className="chart-subtitle">Tasks completed & problems solved per day</div>
                        </div>
                    </div>
                    <div style={{ width: "100%", height: 260 }}>
                        <ResponsiveContainer>
                            <LineChart data={analytics.dailyActivity || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                                <Tooltip contentStyle={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                                <Legend verticalAlign="top" height={36} />
                                <Line type="monotone" dataKey="tasksCompleted" name="Tasks Done" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="problemsSolved" name="Problems Solved" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Bar Chart: Weekly Task Completion */}
                <div className="chart-card col-span-6">
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">📅 Weekly Task Completion</div>
                            <div className="chart-subtitle">Tasks completed per week</div>
                        </div>
                    </div>
                    <div style={{ width: "100%", height: 260 }}>
                        <ResponsiveContainer>
                            <BarChart data={analytics.weeklyTaskCompletion || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
                                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                                <Tooltip contentStyle={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                                <Bar dataKey="completedCount" name="Completed Tasks" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Monthly Progress Chart */}
                <div className="chart-card col-span-6">
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">🗓️ Monthly Learning Progress</div>
                            <div className="chart-subtitle">Completed tasks vs coding problems solved per month</div>
                        </div>
                    </div>
                    <div style={{ width: "100%", height: 260 }}>
                        <ResponsiveContainer>
                            <BarChart data={analytics.monthlyProgress || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                                <Tooltip contentStyle={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                                <Legend verticalAlign="top" height={36} />
                                <Bar dataKey="completedTasks" name="Tasks Completed" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="problemsSolved" name="Problems Solved" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 5. Horizontal Bar Chart: Topic-wise Performance */}
                <div className="chart-card col-span-6">
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">📚 Topic-wise Performance</div>
                            <div className="chart-subtitle">Completion percentage across user topics</div>
                        </div>
                    </div>
                    <div style={{ width: "100%", height: 260 }}>
                        {analytics.topicPerformance?.length > 0 ? (
                            <ResponsiveContainer>
                                <BarChart data={analytics.topicPerformance} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={12} unit="%" />
                                    <YAxis dataKey="topicTitle" type="category" stroke="#64748b" fontSize={11} width={100} />
                                    <Tooltip contentStyle={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                                    <Bar dataKey="percentage" name="Completion %" fill="#818cf8" radius={[0, 6, 6, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                                No topics created yet
                            </div>
                        )}
                    </div>
                </div>

                {/* 6. Problem Solving Over Time */}
                <div className="chart-card col-span-6">
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">💻 Problem Solving Growth</div>
                            <div className="chart-subtitle">Cumulative problems solved over time</div>
                        </div>
                    </div>
                    <div style={{ width: "100%", height: 260 }}>
                        <ResponsiveContainer>
                            <AreaChart data={analytics.problemSolvingOverTime || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCum" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                                <Tooltip contentStyle={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                                <Area type="monotone" dataKey="cumulative" name="Total Solved" stroke="#f59e0b" fillOpacity={1} fill="url(#colorCum)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 8. Streak Consistency Timeline */}
                <div className="chart-card col-span-6">
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">🔥 Daily Streak Consistency</div>
                            <div className="chart-subtitle">Recent daily consistency timeline</div>
                        </div>
                    </div>
                    <div style={{ width: "100%", height: 240 }}>
                        <ResponsiveContainer>
                            <BarChart data={analytics.streakConsistency || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                                <Tooltip contentStyle={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                                <Bar dataKey="streak" name="Streak Days" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Learning Activity Feed */}
            <div className="chart-card col-span-12">
                <div className="chart-header">
                    <div>
                        <div className="chart-title">⏱️ Recent Learning Activities</div>
                        <div className="chart-subtitle">Chronological stream of task completions, coding solutions, and achievements</div>
                    </div>
                </div>

                <div className="activity-feed-list">
                    {analytics.recentActivities?.length > 0 ? (
                        analytics.recentActivities.map((act, i) => (
                            <div className="activity-item" key={i}>
                                <div
                                    className="activity-icon-wrap"
                                    style={{
                                        background: act.type === "complete" ? "rgba(34, 197, 94, 0.1)" :
                                                    act.type === "leetcode" ? "rgba(249, 115, 22, 0.1)" :
                                                    act.type === "streak" ? "rgba(245, 158, 11, 0.1)" : "rgba(79, 70, 229, 0.1)",
                                        color: act.type === "complete" ? "#22c55e" :
                                               act.type === "leetcode" ? "#f97316" :
                                               act.type === "streak" ? "#f59e0b" : "#4f46e5"
                                    }}
                                >
                                    {act.type === "complete" ? <FaCheckCircle /> :
                                     act.type === "leetcode" ? <FaCode /> :
                                     act.type === "streak" ? <FaFire /> : <FaChartLine />}
                                </div>
                                <div className="activity-content">
                                    <div className="activity-title">
                                        {act.type === "complete" ? `✓ ${act.title}` :
                                         act.type === "leetcode" ? `✓ ${act.title}` : act.title}
                                    </div>
                                    <div className="activity-subtitle">{act.subtitle}</div>
                                </div>
                                <div className="activity-time">
                                    {act.createdAt ? new Date(act.createdAt).toLocaleDateString() : ""}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
                            No recent activity recorded for this user.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
