import { useEffect, useMemo, useState } from "react";
import {
    FaBook,
    FaCalendarAlt,
    FaCheck,
    FaClock,
    FaDownload,
    FaHourglassHalf,
    FaFileAlt,
    FaTasks,
    FaSearch,
    FaCheckCircle,
    FaExclamationTriangle
} from "react-icons/fa";
import MainLayout from "../components/layout/MainLayout";
import Loader from "../components/common/Loader";
import { topicService } from "../api/topicService";
import "../styles/history.css";

function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, {
        year: "numeric", month: "short", day: "numeric"
    });
}
function formatDateTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}
function statsFor(topic) {
    const subs = topic?.subtopics || [];
    const total = subs.length;
    const completed = subs.filter((s) => !!s.completed).length;
    let due = 0;
    if (topic.deadline && completed < total) {
        const now = new Date(); now.setHours(23, 59, 59, 999);
        if (new Date(topic.deadline) < now) {
            due = total - completed;
        }
    }
    return {
        total,
        completed,
        pending: total - completed - due,
        due,
        pct: total === 0 ? 0 : Math.round((completed / total) * 100)
    };
}

export default function History() {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);


    function load() {
        setLoading(true);
        setError("");
        topicService.getAll()
            .then((data) => {
                const list = Array.isArray(data) ? data : (data?.items || data?.topics || []);
                setTopics(list);
                // do nothing — user picks from the list
            })
            .catch((e) => setError(e.message || "Failed to load topics."))
            .finally(() => setLoading(false));
    }

    useEffect(() => { load(); }, []);
    const filteredTopics = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return topics;
        return topics.filter((t) =>
            t.name?.toLowerCase().includes(q) ||
            (t.subtopics || []).some((s) => s.name?.toLowerCase().includes(q))
        );
    }, [topics, searchQuery]);
    const sortedTopics = useMemo(() =>
        [...topics].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        [topics]);

    const selected = useMemo(
        () => topics.find((t) => String(t.id) === String(selectedId)) || null,
        [topics, selectedId]
    );

    const selectedStats = selected ? statsFor(selected) : null;

    const overallStats = useMemo(() => {
        const sum = { total: 0, completed: 0, pending: 0, due: 0 };
        topics.forEach((t) => {
            const s = statsFor(t);
            sum.total += s.total;
            sum.completed += s.completed;
            sum.pending += s.pending;
            sum.due += s.due;
        });
        return sum;
    }, [topics]);

    function downloadNotes(subtopic) {
        topicService.getSubtopicNotes(selected.id, subtopic.id)
            .then((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = subtopic.notesFileName || `notes-${subtopic.id}`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 4000);
            })
            .catch((err) => alert(err.message || "Could not download notes."));
    }

    return (
        <MainLayout>
            <div className="page-header">
                <div>
                    <h1>History</h1>
                    <p>Pick any topic to review its subtopics, completion dates, and attached notes.</p>
                </div>
            </div>

            <div className="card history-select-card">
                <div className="history-select-row">
                    <div className="field">
                        <label>Search topics & subtopics</label>
                        <button
                            className="history-search-trigger"
                            onClick={() => { setShowSearch(true); setSearchQuery(""); }}
                            disabled={loading}
                        >
                            <FaSearch size={13} /> Search topics or subtopics...
                        </button>
                    </div>

                    {/* Search Modal */}
                    {showSearch && (
                        <div className="history-search-overlay" onClick={() => setShowSearch(false)}>
                            <div className="history-search-modal" onClick={(e) => e.stopPropagation()}>
                                <div className="history-search-modal-header">
                                    <FaSearch size={14} />
                                    <input
                                        className="history-search-modal-input"
                                        type="text"
                                        placeholder="Type a topic or subtopic name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                    />
                                    <button className="history-search-close" onClick={() => setShowSearch(false)}>✕</button>
                                </div>
                                <ul className="history-search-modal-list">
                                    {filteredTopics.length === 0 ? (
                                        <li className="history-search-empty">No results found</li>
                                    ) : (
                                        filteredTopics.map((t) => (
                                            <li
                                                key={t.id}
                                                className="history-search-modal-item"
                                                onClick={() => { setSelectedId(String(t.id)); setSearchQuery(""); setShowSearch(false); }}
                                            >
                                                <div className="hsm-icon"><FaBook size={12} /></div>
                                                <div className="hsm-text">
                                                    <span className="hsm-topic">{t.name}</span>
                                                    {searchQuery.trim() && (t.subtopics || [])
                                                        .filter((s) => s.name?.toLowerCase().includes(searchQuery.trim().toLowerCase()))
                                                        .map((s) => (
                                                            <span key={s.id} className="hsm-sub"> › {s.name}</span>
                                                        ))
                                                    }
                                                </div>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        </div>
                    )}



                    <div className="history-summary">
                        <div className="history-pill"><FaTasks size={12} /> Total <strong>{overallStats.total}</strong></div>
                        <div className="history-pill success"><FaCheckCircle size={12} /> Completed <strong>{overallStats.completed}</strong></div>
                        <div className="history-pill warning"><FaHourglassHalf size={12} /> Pending <strong>{overallStats.pending}</strong></div>
                        <div className="history-pill danger"><FaExclamationTriangle size={12} /> Due <strong>{overallStats.due}</strong></div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="form-alert form-alert-error" style={{ marginBottom: 20 }}>{error}</div>
            )}

            {loading ? (
                <Loader label="Loading history..." />
            ) : !topics.length ? (
                <div className="card empty-state">
                    <FaBook size={32} />
                    <h3 style={{ margin: "8px 0 4px" }}>No topics yet</h3>
                    <p>Create a topic from the Dashboard first.</p>
                </div>
            ) : !selectedId ? (
                /* ── DEFAULT VIEW: list of topics sorted by createdAt ── */
                <div className="card history-topic-list-card">
                    <div className="history-section-title" style={{ padding: "18px 24px 12px" }}>
                        <span>All Topics ({sortedTopics.length})</span>
                        <span className="chip chip-info">click a topic to view details</span>
                    </div>
                    <ul className="history-topic-list">
                        {sortedTopics.map((t) => {
                            const s = statsFor(t);
                            return (
                                <li
                                    key={t.id}
                                    className="history-topic-list-item"
                                    onClick={() => setSelectedId(String(t.id))}
                                >
                                    <div className="htl-icon"><FaBook size={14} /></div>
                                    <div className="htl-info">
                                        <span className="htl-name">{t.name}</span>
                                        <span className="htl-meta">
                                            <FaTasks size={10} /> {s.total} subtopics &nbsp;·&nbsp;
                                            <FaCalendarAlt size={10} /> {t.deadline ? formatDate(t.deadline) : "No deadline"}
                                        </span>
                                    </div>
                                    <div className="htl-right">
                                        <span className="htl-pct">{s.pct}%</span>
                                        <span className="htl-status">{s.pct === 100 ? "Done" : "In Progress"}</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ) : (
                /* ── DETAIL VIEW: full topic card (existing code) ── */
                <div className="card history-topic-card">
                    <div style={{ padding: "12px 24px 0" }}>
                        <button className="history-back-btn" onClick={() => setSelectedId(null)}>
                            ← Back to all topics
                        </button>
                    </div>
                    <div className="history-topic-head">
                        <div className="history-topic-title-row">
                            <div className="history-topic-title">
                                <div className="history-topic-icon"><FaBook /></div>
                                <div style={{ minWidth: 0 }}>
                                    <h2>{selected.name}</h2>
                                    <div className="history-topic-meta">
                                        <span><FaCalendarAlt size={11} /> Deadline:&nbsp;<strong>{selected.deadline ? formatDate(selected.deadline) : "—"}</strong></span>
                                        <span><FaTasks size={11} /> {selectedStats.total} subtopics</span>
                                    </div>
                                </div>
                            </div>
                            <div className="history-topic-progress">
                                <div className="pct">{selectedStats.pct}%</div>
                                <div className="label">{selectedStats.pct === 100 ? "Completed" : "In Progress"}</div>
                                <div className="history-topic-progress-bar">
                                    <div className="history-topic-progress-bar-fill" style={{ width: `${selectedStats.pct}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="history-topic-body">
                        <div className="history-section-title">
                            <span>Subtopics ({(selected.subtopics || []).length})</span>
                            <span className="chip chip-info">{selectedStats.completed} done · {selectedStats.total - selectedStats.completed} left</span>
                        </div>

                        {(selected.subtopics || []).length === 0 ? (
                            <div className="empty-state"><FaBook size={22} /><p>No subtopics yet.</p></div>
                        ) : (
                            <ul className="history-subtopic-list">
                                {selected.subtopics.map((s) => {
                                    const done = !!s.completed;
                                    return (
                                        <li key={s.id} className={`history-subtopic ${done ? "is-done" : "is-pending"}`}>
                                            <div className="hs-icon">{done ? <FaCheck size={12} /> : <FaClock size={11} />}</div>
                                            <div className="hs-main">
                                                <div className="hs-name">{s.name}</div>
                                                <div className="hs-meta">
                                                    {done ? (
                                                        <span className="hs-meta-item"><FaCheck size={10} /> Completed: <strong>{formatDateTime(s.completedAt) || "—"}</strong></span>
                                                    ) : (
                                                        <span className="hs-meta-item"><FaHourglassHalf size={10} /> Status: <strong>Pending</strong></span>
                                                    )}
                                                </div>
                                                <div className={`hs-notes ${s.notesFileName ? "has-notes" : ""}`}>
                                                    <FaFileAlt size={11} />
                                                    {s.notesFileName ? (
                                                        <>
                                                            <span>{s.notesFileName}</span>
                                                            <span className="hs-notes-link" onClick={() => downloadNotes(s)}>
                                                                <FaDownload size={10} /> View Notes
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="hs-no-notes">No notes attached</span>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            )}

        </MainLayout>
    );
}
