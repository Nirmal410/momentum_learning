import { useEffect, useState } from "react";
import {
    FaClipboardList,
    FaCheckCircle,
    FaCode,
    FaPlusCircle,
    FaCalendarTimes,
    FaFileAlt
} from "react-icons/fa";
import Loader from "../common/Loader";
import { dashboardService } from "../../api/dashboardService";
import "../../styles/dashboard.css";

function pickIcon(type) {
    const t = (type || "").toLowerCase();
    if (t.includes("leetcode") || t.includes("code")) return <FaCode className="act-icon act-icon-leetcode" />;
    if (t.includes("complete") || t.includes("done") || t.includes("checked"))
        return <FaCheckCircle className="act-icon act-icon-success" />;
    if (t.includes("create") || t.includes("add") || t.includes("new"))
        return <FaPlusCircle className="act-icon act-icon-info" />;
    if (t.includes("due") || t.includes("deadline") || t.includes("overdue"))
        return <FaCalendarTimes className="act-icon act-icon-danger" />;
    if (t.includes("note") || t.includes("upload"))
        return <FaFileAlt className="act-icon act-icon-warning" />;
    return <FaClipboardList className="act-icon act-icon-info" />;
}

function pickChip(type) {
    const t = (type || "").toLowerCase();
    if (t.includes("leetcode") || t.includes("code")) return "chip-info";
    if (t.includes("complete") || t.includes("done")) return "chip-success";
    if (t.includes("due") || t.includes("overdue")) return "chip-danger";
    if (t.includes("note") || t.includes("upload")) return "chip-warning";
    if (t.includes("create") || t.includes("add")) return "chip-info";
    return "";
}

function relTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString();
}

export default function RemainderCard({ onRefreshKey }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [items, setItems] = useState([]);

    function load() {
        setLoading(true);
        setError("");
        dashboardService.getRecentActivity()
            .then((data) => {
                setItems(Array.isArray(data) ? data : data?.items || []);
            })
            .catch((e) => setError(e.message || "Failed to load activity."))
            .finally(() => setLoading(false));
    }

    useEffect(() => { load(); }, [onRefreshKey]);

    // Fallback demo items when backend returns empty
    const displayItems = items.length > 0 ? items : [
        { type: "topic", title: "Start your first topic", subtitle: "Click Add Topic to begin", createdAt: new Date().toISOString() }
    ];

    return (
        <div className="card recent-activity">
            <div className="section-title">
                <h3>Recent Activity</h3>
                <button className="btn btn-ghost btn-sm" onClick={load}>Refresh</button>
            </div>

            {error && <div className="form-alert form-alert-error">{error}</div>}

            {loading ? (
                <Loader label="Loading activity..." />
            ) : displayItems.length === 0 ? (
                <div className="empty-state">
                    <FaClipboardList size={30} />
                    <p>No activity yet.</p>
                </div>
            ) : (
                <ul className="activity-list">
                    {displayItems.map((a, i) => (
                        <li key={i} className="activity-item">
                            <div className="activity-left">
                                {pickIcon(a.type)}
                                <div className="activity-meta">
                                    <p className="activity-title">{a.title}</p>
                                    {a.subtitle && <p className="activity-sub">{a.subtitle}</p>}
                                </div>
                            </div>
                            <div className="activity-right">
                                <span className={`chip ${pickChip(a.type)}`}>{relTime(a.createdAt)}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}