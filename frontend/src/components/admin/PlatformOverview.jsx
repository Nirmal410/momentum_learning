import { useState, useEffect } from "react";
import {
    FaUsers, FaUserCheck, FaUserPlus, FaBookOpen,
    FaCheckCircle, FaCode, FaFire, FaChartLine
} from "react-icons/fa";
import {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    BarChart, Bar
} from "recharts";
import { getPlatformOverview } from "../../api/adminService";

const PIE_COLORS = ["#22c55e", "#f97316", "#ef4444", "#3b82f6", "#a855f7", "#06b6d4"];
const DIFF_COLORS = { Easy: "#22c55e", Medium: "#f59e0b", Hard: "#ef4444" };

export default function PlatformOverview() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getPlatformOverview();
            if (res.data && res.data.data) {
                setData(res.data.data);
            }
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load platform statistics.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-loading-state" style={{ padding: "3rem", textAlign: "center" }}>
                <div className="spinner"></div>
                <p style={{ marginTop: "1rem", color: "#64748b" }}>Loading platform statistics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card" style={{ padding: "2rem", textAlign: "center", color: "#ef4444" }}>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={loadData} style={{ marginTop: "1rem" }}>
                    Retry Loading
                </button>
            </div>
        );
    }

    if (!data) return null;

    // Format task stats for Pie chart
    const taskStatsData = [
        { name: "Completed", value: data.taskCompletionStats?.completed || 0, color: "#22c55e" },
        { name: "Pending", value: data.taskCompletionStats?.pending || 0, color: "#f97316" },
        { name: "Due", value: data.taskCompletionStats?.due || 0, color: "#ef4444" },
    ].filter((d) => d.value > 0);

    return (
        <div>
            {/* 1. Statistic Cards */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-info">
                        <label>Total Users</label>
                        <div className="admin-stat-number">{data.totalUsers}</div>
                        <div className="admin-stat-subtitle">Registered on Platform</div>
                    </div>
                    <div className="admin-stat-icon icon-blue">
                        <FaUsers />
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-info">
                        <label>Active Users</label>
                        <div className="admin-stat-number">{data.activeUsers}</div>
                        <div className="admin-stat-subtitle">Account Status Active</div>
                    </div>
                    <div className="admin-stat-icon icon-green">
                        <FaUserCheck />
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-info">
                        <label>New This Week</label>
                        <div className="admin-stat-number">{data.newUsersThisWeek}</div>
                        <div className="admin-stat-subtitle">Joined in last 7 days</div>
                    </div>
                    <div className="admin-stat-icon icon-purple">
                        <FaUserPlus />
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-info">
                        <label>Topics Created</label>
                        <div className="admin-stat-number">{data.totalTopics}</div>
                        <div className="admin-stat-subtitle">Learning Subjects</div>
                    </div>
                    <div className="admin-stat-icon icon-indigo">
                        <FaBookOpen />
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-info">
                        <label>Completed Tasks</label>
                        <div className="admin-stat-number">{data.totalCompletedTasks}</div>
                        <div className="admin-stat-subtitle">Subtopics finished</div>
                    </div>
                    <div className="admin-stat-icon icon-green">
                        <FaCheckCircle />
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-info">
                        <label>Problems Solved</label>
                        <div className="admin-stat-number">{data.totalProblemsSolved}</div>
                        <div className="admin-stat-subtitle">Across all platforms</div>
                    </div>
                    <div className="admin-stat-icon icon-orange">
                        <FaCode />
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-info">
                        <label>Average Streak</label>
                        <div className="admin-stat-number">{data.averageStreak} <span style={{ fontSize: "1rem" }}>days</span></div>
                        <div className="admin-stat-subtitle">User consistency</div>
                    </div>
                    <div className="admin-stat-icon icon-amber">
                        <FaFire />
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-info">
                        <label>Users on Streak</label>
                        <div className="admin-stat-number">{data.usersOnStreak}</div>
                        <div className="admin-stat-subtitle">Current active streak &gt; 0</div>
                    </div>
                    <div className="admin-stat-icon icon-rose">
                        <FaChartLine />
                    </div>
                </div>
            </div>

            {/* 2. Visual Charts Grid */}
            <div className="admin-charts-grid">
                {/* Daily/Weekly Platform Activity (Line/Area Chart) */}
                <div className="chart-card col-span-8">
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">📈 Platform Daily Activity</div>
                            <div className="chart-subtitle">Task completions & problem solving over the last 14 days</div>
                        </div>
                    </div>
                    <div style={{ width: "100%", height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={data.dailyPlatformActivity} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                                    </linearGradient>
                                    <linearGradient id="colorProblems" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                                <Tooltip contentStyle={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                                <Legend verticalAlign="top" height={36} />
                                <Area type="monotone" dataKey="tasksCompleted" name="Tasks Completed" stroke="#4f46e5" fillOpacity={1} fill="url(#colorTasks)" />
                                <Area type="monotone" dataKey="problemsSolved" name="Problems Solved" stroke="#f97316" fillOpacity={1} fill="url(#colorProblems)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Overall Task Completion Breakdown (Doughnut Chart) */}
                <div className="chart-card col-span-4">
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">📊 Overall Task Completion</div>
                            <div className="chart-subtitle">Completed vs Pending vs Due</div>
                        </div>
                    </div>
                    <div style={{ width: "100%", height: 300 }}>
                        {taskStatsData.length > 0 ? (
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={taskStatsData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={95}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {taskStatsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                                No task data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Topic Popularity (Bar Chart) */}
                <div className="chart-card col-span-6">
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">📚 Topic & Category Popularity</div>
                            <div className="chart-subtitle">Most created learning subjects across users</div>
                        </div>
                    </div>
                    <div style={{ width: "100%", height: 280 }}>
                        <ResponsiveContainer>
                            <BarChart data={data.topicPopularity} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={110} />
                                <Tooltip contentStyle={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                                <Bar dataKey="count" name="Topics Created" fill="#6366f1" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* User Streak Distribution (Bar Chart) */}
                <div className="chart-card col-span-6">
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">🔥 User Streak Distribution</div>
                            <div className="chart-subtitle">Consistency levels among platform members</div>
                        </div>
                    </div>
                    <div style={{ width: "100%", height: 280 }}>
                        <ResponsiveContainer>
                            <BarChart data={data.streakDistribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="range" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                                <Tooltip contentStyle={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                                <Bar dataKey="userCount" name="Users" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
