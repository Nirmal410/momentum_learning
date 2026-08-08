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

    function load() {
        setLoading(true);
        setError("");
        topicService.getAll()
            .then((data) => {
                const list = Array.isArray(data) ? data : (data?.items || data?.topics || []);
                setTopics(list);
                if (list.length && !selectedId) setSelectedId(String(list[0].id));
            })
            .catch((e) => setError(e.message || "Failed to load topics."))
            .finally(() => setLoading(false));
    }

    useEffect(() => { load(); }, []);

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
                        <label>Select a topic</label>
                        <select
                            className="select"
                            value={selectedId || ""}
                            onChange={(e) => setSelectedId(e.target.value)}
                            disabled={loading || !topics.length}
                        >
                            {!topics.length && <option value="">No topics yet</option>}
                            {topics.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
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
            ) : !selected ? (
                <div className="card empty-state">
                    <FaBook size={32} />
                    <h3 style={{ margin: "8px 0 4px" }}>No topic selected</h3>
                    <p>Create a topic from the Dashboard first, then pick it above.</p>
                </div>
            ) : (
                <div className="card history-topic-card">
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
