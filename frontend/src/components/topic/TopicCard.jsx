import { useRef, useState } from "react";
import {
    FaBook,
    FaChevronDown,
    FaCheck,
    FaCalendarAlt,
    FaFileUpload,
    FaFileAlt,
    FaDownload,
    FaTrash
} from "react-icons/fa";
import Loader from "../common/Loader";
import { topicService } from "../../api/topicService";
import "../../styles/progress.css";

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

function pickClassByStatus(status) {
    // status: "completed" | "due" | "default" (pending)
    if (status === "completed") return "is-completed";
    if (status === "due") return "is-due";
    return "";
}

export default function TopicCard({ topic, expanded, onToggle, onUpdate }) {
    const [togglingId, setTogglingId] = useState(null);
    const [uploadingId, setUploadingId] = useState(null);
    const fileInputRefs = useRef({});

    if (!topic) return null;

    const subtopics = topic.subtopics || [];
    const total = subtopics.length;
    const completed = subtopics.filter((s) => !!s.completed).length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

    const isOverdue = (() => {
        if (topic.deadline && completed < total) {
            const now = new Date(); now.setHours(23,59,59,999);
            const d = new Date(topic.deadline);
            return d < now;
        }
        return false;
    })();
    const isAllDone = total > 0 && completed === total;

    const status = isAllDone ? "completed" : (isOverdue ? "due" : "default");
    const cardClass = `topic-card ${expanded ? "expanded" : ""} ${pickClassByStatus(status)}`;

    function openFilePicker(subId) {
        const input = fileInputRefs.current[subId];
        if (input) input.click();
    }

    async function handleToggleSubtopic(sub) {
        if (togglingId) return;
        setTogglingId(sub.id);
        try {
            const updated = await topicService.toggleSubtopic(topic.id, sub.id);
            if (onUpdate) onUpdate();
            return updated;
        } catch (err) {
            alert(err.message || "Failed to toggle subtopic.");
        } finally {
            setTogglingId(null);
        }
    }

    function triggerNotesDownload(sub) {
        // Fallback: uses GET endpoint as blob, opens object URL in new tab
        topicService.getSubtopicNotes(topic.id, sub.id)
            .then((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = sub.notesFileName || `notes-${sub.id}`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 4000);
            })
            .catch((err) => alert(err.message || "Could not download notes."));
    }

    async function handleFileChange(sub, e) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate extension
        const ok = /\.(pdf|docx?|txt|rtf)$/i.test(file.name);
        if (!ok) {
            alert("Only PDF, DOC, DOCX, and TXT files are allowed.");
            e.target.value = "";
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            alert("File too large (max 20MB).");
            e.target.value = "";
            return;
        }

        setUploadingId(sub.id);
        try {
            const fd = new FormData();
            fd.append("notesFile", file);
            await topicService.uploadSubtopicNotes(topic.id, sub.id, fd);
            if (onUpdate) onUpdate();
        } catch (err) {
            alert(err.message || "Failed to upload notes.");
        } finally {
            setUploadingId(null);
            e.target.value = "";
        }
    }

    return (
        <article className={cardClass}>
            <header className="topic-card-header" onClick={onToggle}>
                <div className="topic-card-head-row1">
                    <div className="topic-title-row">
                        <div className="topic-icon"><FaBook /></div>
                        <div className="topic-title">
                            <h3>{topic.name}</h3>
                            {topic.deadline && (
                                <div className="topic-deadline">
                                    <FaCalendarAlt size={10} />
                                    {isAllDone ? "Completed — deadline " : isOverdue ? "Overdue — " : "Deadline: "}
                                    <strong>{formatDate(topic.deadline)}</strong>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="topic-expand-arrow">
                        <FaChevronDown size={14} />
                    </div>
                </div>
            </header>

            <div className="topic-progress-area">
                <div className="topic-progress-row">
                    <span>{completed} of {total} subtopics</span>
                    <span className={`topic-progress-pct ${pct === 100 ? "completed" : (isOverdue ? "due" : "")}`}>
                        {pct}%
                    </span>
                </div>
                <div className="progress-bar">
                    <div
                        className={`progress-fill ${pct < 100 && isOverdue ? "progress-fill-danger" : (pct < 50 ? "progress-fill-warning" : "")}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>

            <div className="topic-subtopics-wrap" style={expanded ? { maxHeight: `${Math.max(240, subtopics.length * 110 + 80)}px` } : undefined}>
                <div className="topic-subtopics">
                    {subtopics.length === 0 ? (
                        <div className="empty-state"><FaBook size={22} /><p>No subtopics.</p></div>
                    ) : (
                        <ul className="subtopic-list">
                            {subtopics.map((sub) => {
                                const isChecked = !!sub.completed;
                                const isToggling = togglingId === sub.id;
                                const isUploading = uploadingId === sub.id;
                                return (
                                    <li key={sub.id} className={`subtopic-item ${isChecked ? "is-checked" : ""}`}>
                                        <button
                                            type="button"
                                            className={`subtopic-tick ${isChecked ? "checked" : ""}`}
                                            onClick={() => handleToggleSubtopic(sub)}
                                            disabled={isToggling}
                                            aria-label={isChecked ? "Mark pending" : "Mark completed"}
                                        >
                                            {isChecked && <FaCheck size={10} />}
                                        </button>

                                        <div className="subtopic-main">
                                            <div className="subtopic-name">{sub.name}</div>
                                            {isChecked && sub.completedAt && (
                                                <div className="subtopic-completed-at">
                                                    Completed {formatDateTime(sub.completedAt)}
                                                </div>
                                            )}
                                            {sub.notesFileName && (
                                                <div className="subtopic-notes-info">
                                                    <FaFileAlt size={11} />
                                                    <span>Attached:</span>
                                                    <a onClick={() => triggerNotesDownload(sub)} title="Download">
                                                        {sub.notesFileName}
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        <div className="subtopic-actions">
                                            <input
                                                type="file"
                                                ref={(el) => (fileInputRefs.current[sub.id] = el)}
                                                style={{ display: "none" }}
                                                accept=".pdf,.doc,.docx,.txt,.rtf"
                                                onChange={(e) => handleFileChange(sub, e)}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline btn-tiny"
                                                onClick={() => openFilePicker(sub.id)}
                                                disabled={isUploading || isToggling}
                                            >
                                                <FaFileUpload size={10} />
                                                {sub.notesFileName ? "Replace notes" : "Upload notes"}
                                            </button>
                                            {isUploading && <span className="uploading-indicator">Uploading…</span>}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {togglingId === "page" && <Loader label="Updating..." />}
                </div>
            </div>
        </article>
    );
}