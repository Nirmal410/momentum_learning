import { useEffect, useState } from "react";
import {
    FaTasks,
    FaCheckCircle,
    FaHourglassHalf,
    FaExclamationTriangle,
    FaCalendarAlt
} from "react-icons/fa";
import MainLayout from "../components/layout/MainLayout";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatCard from "../components/dashboard/StateCard";
import Calendar from "../components/dashboard/Calendar";
import RemainderCard from "../components/dashboard/RemainderCard";
import TopicsWithDeadlines from "../components/dashboard/TopicsWithDeadlines";
import WeeklyStreak from "../components/dashboard/WeeklyStreak";
import Loader from "../components/common/Loader";
import { dashboardService } from "../api/dashboardService";
import { useAddTopicModal } from "../context/AddTopicModalContext";
import "../styles/dashboard.css";

export default function Dashboard() {
    const { openModal, setOnCreated } = useAddTopicModal();
    const [refreshKey, setRefreshKey] = useState(0);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [summaryError, setSummaryError] = useState("");
    const [summary, setSummary] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
        upcoming: 0
    });

    function bump() {
        setRefreshKey((k) => k + 1);
    }

    function loadSummary() {
        setSummaryLoading(true);
        setSummaryError("");
        dashboardService.getSummary()
            .then((data) => {
                setSummary({
                    total: data?.total ?? 0,
                    completed: data?.completed ?? 0,
                    pending: data?.pending ?? 0,
                    overdue: data?.overdue ?? data?.due ?? 0,
                    upcoming: data?.upcoming ?? 0
                });
            })
            .catch((e) => setSummaryError(e.message || "Failed to load summary."))
            .finally(() => setSummaryLoading(false));
    }

    useEffect(() => { loadSummary(); }, [refreshKey]);

    // Register so the shared AddTopicModal notifies us after creation
    useEffect(() => {
        setOnCreated(() => bump);
        return () => setOnCreated(null);
    }, [setOnCreated]);

    const stats = [
        {
            title: "Total Tasks",
            value: summary.total,
            icon: <FaTasks />,
            variant: "info"
        },
        {
            title: "Completed",
            value: summary.completed,
            icon: <FaCheckCircle />,
            variant: "success"
        },
        {
            title: "Pending",
            value: summary.pending,
            icon: <FaHourglassHalf />,
            variant: "default"
        },
        {
            title: "Due",
            value: summary.overdue,
            icon: <FaExclamationTriangle />,
            variant: "danger"
        },
        {
            title: "Upcoming",
            value: summary.upcoming,
            icon: <FaCalendarAlt />,
            variant: "warning"
        }
    ];

    return (
        <MainLayout>
            <DashboardHeader onAdd={openModal} />

            {/* Summary Stats */}
            {summaryError && (
                <div className="form-alert form-alert-error" style={{ marginBottom: 20 }}>
                    {summaryError}
                </div>
            )}

            {summaryLoading ? (
                <Loader label="Loading dashboard..." />
            ) : (
                <div className="stats-grid">
                    {stats.map((s) => (
                        <StatCard
                            key={s.title}
                            title={s.title}
                            value={s.value}
                            icon={s.icon}
                            variant={s.variant}
                        />
                    ))}
                </div>
            )}

            {/* Weekly Streak */}
            <WeeklyStreak onRefreshKey={refreshKey} />

            {/* Calendar + Recent Activity (side by side) */}
            <div className="dashboard-grid-bottom">
                <div className="dashboard-left-col">
                    <Calendar onRefreshKey={refreshKey} />
                    <TopicsWithDeadlines onRefreshKey={refreshKey} />
                </div>
                <RemainderCard onRefreshKey={refreshKey} />
            </div>
        </MainLayout>
    );
}
