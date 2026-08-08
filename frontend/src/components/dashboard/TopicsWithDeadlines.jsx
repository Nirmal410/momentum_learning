import { useEffect, useState } from "react";
import { FaBook, FaCalendarAlt, FaCheck, FaClock, FaExclamationTriangle } from "react-icons/fa";
import Loader from "../common/Loader";
import { topicService } from "../../api/topicService";
import "../../styles/dashboard.css";

function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function daysUntil(iso) {
    if (!iso) return null;
    const target = new Date(iso);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const ms = target.getTime() - today.getTime();
    return Math.round(ms / (1000 * 60 * 60 * 24));
}

export default function TopicsWithDeadlines({ onRefreshKey }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [topics, setTopics] = useState([]);

    function load() {
        setLoading(true);
        setError("");
        topicService.getAll()
            .then((data) => {
                const list = Array.isArray(data) ? data : (data?.items || data?.topics || []);
                const sorted = [...list].sort((a, b) => {
                    if (!a.deadline && !b.deadline) return 0;
                    if (!a.deadline) return 1;
                    if (!b.deadline) return -1;
                    return new Date(a.deadline) - new Date(b.deadline);
                });
                setTopics(sorted);
            })
            .catch((e) => setError(e.message || "Failed to load topics."))
            .finally(() => setLoading(false));
    }

    useEffect(() => { load(); }, [onRefreshKey]);

    function statusMeta(t) {
        const subs = t.subtopics || [];
        const total = subs.length;
        const done = subs.filter((s) => !!s.completed).length;
        const allDone = total > 0 && done === total;
        const days = daysUntil(t.deadline);
        let status = "pending";
        if (allDone) status = "completed";
        else if (t.deadline && days != null && days < 0) status = "due";
        else if (t.deadline && days != null && days <= 7) status = "upcoming";
        return { total, done, status, days };
    }

    function statusIcon(status) {
        switch (status) {
            case "completed": return <FaCheck size={10} />;
            case "due": return <FaExclamationTriangle size={10} />;
            case "upcoming": return <FaCalendarAlt size={10} />;
            default: return <FaClock size={10} />;
        }
    }

    return (
        <div className="card dashboard-topics-deadlines">
            <div className="section-title">
                <h3>All Topics with Deadlines</h3>
                <span className="chip chip-info">{topics.length} topic{topics.length === 1 ? "" : "s"}</span>
            </div>

            {error && <div className="form-alert form-alert-error">{error}</div>}

            {loading ? (
                <Loader label="Loading topics..." />
            ) : topics.length === 0 ? (
                <div className="empty-state" style={{ padding: "32px 24px" }}>
                    <FaBook size={28} />
                    <p>No topics yet. Click "Add Topic" to get started.</p>
                </div>
            ) : (
                <ul className="topic-deadline-list">
                    {topics.map((t) => {
                        const meta = statusMeta(t);
                        const deadlineText = formatDate(t.deadline);
                        const daysText = (() => {
                            if (meta.days == null) return "";
                            if (meta.status === "completed") return "Completed";
                            if (meta.days < 0) return `${Math.abs(meta.days)}d overdue`;
                            if (meta.days === 0) return "Due today";
                            return `${meta.days}d left`;
                        })();
                        const pct = meta.total === 0 ? 0 : Math.round((meta.done / meta.total) * 100);
                        return (
                            <li key={t.id} className={`topic-deadline-item td-${meta.status}`}>
                                <div className="td-icon">
                                    <FaBook size={14} />
                                </div>
                                <div className="td-main">
                                    <div className="td-title">{t.name || t.title}</div>
                                    <div className="td-meta">
                                        <span className={`td-status-chip td-status-${meta.status}`}>
                                            {statusIcon(meta.status)}
                                            <span>
                                                {meta.status === "completed" && "Completed"}
                                                {meta.status === "due" && "Overdue"}
                                                {meta.status === "upcoming" && "Upcoming"}
                                                {meta.status === "pending" && "Pending"}
                                            </span>
                                        </span>
                                        <span className="td-progress-count">
                                            {meta.done}/{meta.total} subtasks
                                        </span>
                                    </div>
                                    <div className="td-progress-bar">
                                        <div
                                            className={`td-progress-fill ${pct === 100 ? "fill-done" : meta.status === "due" ? "fill-danger" : pct < 50 ? "fill-warning" : ""}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="td-deadline">
                                    <div className="td-deadline-date">
                                        <FaCalendarAlt size={10} />
                                        {deadlineText}
                                    </div>
                                    {daysText && (
                                        <div className={`td-deadline-days td-days-${meta.status}`}>
                                            {daysText}
                                        </div>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
