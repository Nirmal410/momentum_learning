import { useEffect, useMemo, useState } from "react";
import { FaTasks, FaHourglassHalf, FaExclamationTriangle, FaCheckCircle, FaBook } from "react-icons/fa";
import MainLayout from "../components/layout/MainLayout";
import TopicCard from "../components/topic/TopicCard";
import Loader from "../components/common/Loader";
import { topicService } from "../api/topicService";
import { useAddTopicModal } from "../context/AddTopicModalContext";
import "../styles/progress.css";

const FILTERS = [
    { id: "all",       label: "All",        icon: <FaTasks size={12} /> },
    { id: "pending",   label: "Pending",    icon: <FaHourglassHalf size={12} /> },
    { id: "due",       label: "Due",        icon: <FaExclamationTriangle size={12} /> },
    { id: "completed", label: "Completed",  icon: <FaCheckCircle size={12} /> }
];

function classifyTopic(t) {
    const subs = t.subtopics || [];
    const total = subs.length;
    const done = subs.filter((s) => !!s.completed).length;
    const allDone = total > 0 && done === total;
    let overdue = false;
    if (t.deadline && !allDone) {
        const now = new Date(); now.setHours(23, 59, 59, 999);
        overdue = new Date(t.deadline) < now;
    }
    return {
        total, done,
        isCompleted: allDone,
        isDue: overdue && !allDone,
        isPending: !allDone && !overdue
    };
}

export default function Progress() {
    const { setOnCreated } = useAddTopicModal();
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [expandedId, setExpandedId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    function bump() { setRefreshKey((k) => k + 1); }

    function load() {
        setLoading(true);
        setError("");
        topicService.getAll()
            .then((data) => {
                const list = Array.isArray(data) ? data : (data?.items || data?.topics || []);
                setTopics(list);
            })
            .catch((e) => setError(e.message || "Failed to load topics."))
            .finally(() => setLoading(false));
    }

    useEffect(() => { load(); }, [refreshKey]);

    useEffect(() => {
        setOnCreated(() => bump);
        return () => setOnCreated(null);
    }, [setOnCreated]);

    const counts = useMemo(() => {
        const c = { all: 0, pending: 0, due: 0, completed: 0 };
        topics.forEach((t) => {
            const k = classifyTopic(t);
            c.all++;
            if (k.isCompleted) c.completed++;
            else if (k.isDue) c.due++;
            else c.pending++;
        });
        return c;
    }, [topics]);

    const visibleTopics = useMemo(() => {
        if (activeFilter === "all") return topics;
        return topics.filter((t) => {
            const k = classifyTopic(t);
            if (activeFilter === "completed") return k.isCompleted;
            if (activeFilter === "due") return k.isDue;
            if (activeFilter === "pending") return k.isPending;
            return true;
        });
    }, [topics, activeFilter]);

    function handleUpdate() {
        setRefreshKey((k) => k + 1);
    }

    function toggleCard(id) {
        setExpandedId((prev) => (prev === id ? null : id));
    }

    const filterLabel = FILTERS.find((f) => f.id === activeFilter)?.label || "";

    return (
        <MainLayout>
            <div className="page-header">
                <div>
                    <h1>Progress</h1>
                    <p>Track, filter, and update each topic and its subtopics.</p>
                </div>
            </div>

            <div className="progress-filter-tabs">
                {FILTERS.map((f) => (
                    <button
                        key={f.id}
                        className={`filter-tab filter-tab-${f.id} ${activeFilter === f.id ? "active" : ""}`}
                        onClick={() => setActiveFilter(f.id)}
                    >
                        {f.icon}
                        {f.label}
                        <span className="filter-tab-count">{counts[f.id] ?? 0}</span>
                    </button>
                ))}
            </div>

            {error && (
                <div className="form-alert form-alert-error" style={{ marginBottom: 20 }}>{error}</div>
            )}

            {loading ? (
                <Loader label="Loading topics..." />
            ) : visibleTopics.length === 0 ? (
                <div className="card empty-state">
                    <FaBook size={34} />
                    <h3 style={{ margin: "8px 0 4px" }}>
                        {filterLabel === "All" ? "No topics yet" : `No ${filterLabel.toLowerCase()} topics`}
                    </h3>
                    <p>
                        {filterLabel === "All"
                            ? "Go to Dashboard and click Add Topic to begin."
                            : "Try a different filter tab."}
                    </p>
                </div>
            ) : (
                <div className="topic-grid">
                    {visibleTopics.map((t) => (
                        <TopicCard
                            key={t.id}
                            topic={t}
                            expanded={expandedId === t.id}
                            onToggle={() => toggleCard(t.id)}
                            onUpdate={handleUpdate}
                        />
                    ))}
                </div>
            )}
        </MainLayout>
    );
}
