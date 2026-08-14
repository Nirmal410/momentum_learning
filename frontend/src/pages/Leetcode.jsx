import { useEffect, useRef, useState } from "react";
import { FaCamera, FaDesktop, FaCode, FaPlus, FaFileCode, FaCopy, FaCheck, FaDownload } from "react-icons/fa";
import MainLayout from "../components/layout/MainLayout";
import Modal from "../components/common/Modal";
import Loader from "../components/common/Loader";
import api from "../api/api";
import {
    addLeetcodeEntry,
    getLeetcodeEntries,
    getLeetcodeStreak,
    photoUrl,
    codeScreenshotUrl
} from "../api/leetcodeService";
import "../styles/leetcode.css";

const emptyForm = { problemTitle: "", notes: "" };

const isImageFile = (file) => {
    if (!file) return false;
    if (file.type) return file.type.startsWith("image/");
    const name = file.name || "";
    return /\.(png|jpe?g|gif|webp)$/i.test(name);
};

export default function Leetcode() {

    const [form, setForm] = useState(emptyForm);
    const [taskPhoto, setTaskPhoto] = useState(null);
    const [taskPhotoPreview, setTaskPhotoPreview] = useState(null);
    const [codeScreenshot, setCodeScreenshot] = useState(null);
    const [codeScreenshotPreview, setCodeScreenshotPreview] = useState(null);

    const [entries, setEntries] = useState([]);
    const [streak, setStreak] = useState(0);
    const [loadingEntries, setLoadingEntries] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showAll, setShowAll] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [lightbox, setLightbox] = useState({ open: false, src: "", title: "" });
    const [codeModal, setCodeModal] = useState({ open: false, content: "", title: "", copied: false });

    const photoInputRef = useRef(null);
    const screenshotInputRef = useRef(null);

    const loadData = async () => {
        try {
            setLoadingEntries(true);
            const [entriesRes, streakRes] = await Promise.all([
                getLeetcodeEntries(),
                getLeetcodeStreak()
            ]);
            setEntries(entriesRes.data.data || []);
            setStreak(streakRes.data.data || 0);
        } catch (err) {
            setError("Unable to load your LeetCode history.");
        } finally {
            setLoadingEntries(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setTaskPhoto(file);
        setTaskPhotoPreview(URL.createObjectURL(file));
    };

    const handleScreenshotChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setCodeScreenshot(file);
        if (file.type && file.type.startsWith("image/")) {
            setCodeScreenshotPreview(URL.createObjectURL(file));
        } else {
            setCodeScreenshotPreview(file.name);
        }
    };

    const resetForm = () => {
        setForm(emptyForm);
        setTaskPhoto(null);
        setTaskPhotoPreview(null);
        setCodeScreenshot(null);
        setCodeScreenshotPreview(null);
        if (photoInputRef.current) photoInputRef.current.value = "";
        if (screenshotInputRef.current) screenshotInputRef.current.value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!form.problemTitle.trim()) {
            setError("Please enter a problem title or number.");
            return;
        }

        const data = new FormData();
        data.append("problemTitle", form.problemTitle.trim());
        if (form.notes.trim()) data.append("notes", form.notes.trim());
        if (taskPhoto) data.append("taskPhoto", taskPhoto);
        if (codeScreenshot) data.append("codeScreenshot", codeScreenshot);

        try {
            setSubmitting(true);
            await addLeetcodeEntry(data);
            setSuccess("Entry logged. Keep the streak going!");
            resetForm();
            setIsModalOpen(false);
            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || "Unable to submit entry. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr, createdAt) => {
        const entryDate = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const isSameDay = (a, b) =>
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate();

        const time = createdAt
            ? new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "";

        if (isSameDay(entryDate, today)) return `Today, ${time}`;
        if (isSameDay(entryDate, yesterday)) return "Yesterday";

        return entryDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    };

    const openImage = async (url, title) => {
        try {
            const res = await api.get(url, { responseType: "blob" });
            const objectUrl = URL.createObjectURL(res.data);
            setLightbox({ open: true, src: objectUrl, title });
        } catch (_) {
            setError("Unable to load image.");
        }
    };

    const openCodeFile = async (url, title, contentType) => {
        try {
            const res = await api.get(url, { responseType: "blob" });
            const type = res.headers["content-type"] || contentType || res.data.type || "";
            if (type.startsWith("image/")) {
                const objectUrl = URL.createObjectURL(res.data);
                setLightbox({ open: true, src: objectUrl, title });
            } else {
                const text = await res.data.text();
                setCodeModal({ open: true, content: text, title, copied: false });
            }
        } catch (_) {
            setError("Unable to load code file.");
        }
    };

    const visibleEntries = showAll ? entries : entries.slice(0, 5);

    return (
        <MainLayout>
            <div className="lc-header">
                <div>
                    <h1>Daily Tracker</h1>
                    <p>Log your daily coding exercises to maintain your streak.</p>
                </div>
                <div className="lc-header-actions">
                    <div className="lc-streak">
                        Streak: <strong>{streak}</strong> Day{streak === 1 ? "" : "s"}
                    </div>
                    <button
                        className="lc-add-btn"
                        onClick={() => {
                            setError("");
                            setSuccess("");
                            setIsModalOpen(true);
                        }}
                    >
                        <FaPlus size={12} /> Add Today Progress
                    </button>
                </div>
            </div>

            {success && <p className="lc-success" style={{ marginBottom: 20 }}>{success}</p>}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Log Today's Progress"
                size="md"
            >
                <form className="lc-modal-form" onSubmit={handleSubmit}>
                    <label className="lc-label">Problem Title / Number</label>
                    <input
                        className="lc-input"
                        type="text"
                        name="problemTitle"
                        placeholder="e.g., Two Sum, #1"
                        value={form.problemTitle}
                        onChange={handleChange}
                    />

                    <div className="lc-uploads">
                        <div>
                            <label className="lc-label">Task Completed Picture</label>
                            <div className="lc-upload-box" onClick={() => photoInputRef.current?.click()}>
                                {taskPhotoPreview ? (
                                    <img src={taskPhotoPreview} alt="Task preview" />
                                ) : (
                                    <>
                                        <FaCamera size={28} />
                                        <span>Click to upload photo</span>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/png, image/jpeg"
                                ref={photoInputRef}
                                onChange={handlePhotoChange}
                                hidden
                            />
                        </div>

                        <div>
                            <label className="lc-label">Code File / Screenshot</label>
                            <div className="lc-upload-box" onClick={() => screenshotInputRef.current?.click()}>
                                {codeScreenshot ? (
                                    isImageFile(codeScreenshot) ? (
                                        <img src={codeScreenshotPreview} alt="Code preview" />
                                    ) : (
                                        <div className="lc-file-preview">
                                            <FaFileCode size={30} className="lc-file-icon" />
                                            <span className="lc-file-name">{codeScreenshot.name}</span>
                                            <span className="lc-file-badge">
                                                {(codeScreenshot.name.split('.').pop() || 'FILE').toUpperCase()}
                                            </span>
                                            <span className="lc-file-size">{(codeScreenshot.size / 1024).toFixed(1)} KB</span>
                                        </div>
                                    )
                                ) : (
                                    <>
                                        <FaFileCode size={28} />
                                        <span>Upload .txt or .java file</span>
                                        <span style={{ fontSize: "11px", opacity: 0.75 }}>
                                            (.java, .txt, code or image)
                                        </span>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                accept=".java,.txt,.py,.cpp,.c,.cs,.js,.ts,.html,.css,.json,.md,.kt,.rs,.go,image/png,image/jpeg,text/plain"
                                ref={screenshotInputRef}
                                onChange={handleScreenshotChange}
                                hidden
                            />
                        </div>
                    </div>

                    <label className="lc-label">Notes (optional)</label>
                    <textarea
                        className="lc-textarea"
                        name="notes"
                        placeholder="Any insights or difficulties?"
                        value={form.notes}
                        onChange={handleChange}
                    />

                    {error && <p className="lc-error">{error}</p>}

                    <button type="submit" className="lc-submit" disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit Entry"}
                    </button>
                </form>
            </Modal>

            <div className="lc-recent-header">
                <h3>Recent Submissions</h3>
                {entries.length > 5 && (
                    <button className="lc-view-all" onClick={() => setShowAll(!showAll)}>
                        {showAll ? "Show Less" : "View All"}
                    </button>
                )}
            </div>

            {loadingEntries ? (
                <Loader label="Loading your submissions..." />
            ) : entries.length === 0 ? (
                <p className="lc-empty">No submissions yet. Log your first solved problem above.</p>
            ) : (
                <div className="lc-submissions">
                    {visibleEntries.map((entry) => (
                        <div className="lc-submission" key={entry.id}>
                            <div className="lc-submission-icon">
                                <FaCode />
                            </div>
                            <div className="lc-submission-info">
                                <h4>{entry.problemTitle}</h4>
                                {entry.notes && <p className="lc-submission-notes">{entry.notes}</p>}
                            </div>
                            <div className="lc-submission-date">
                                {formatDate(entry.entryDate, entry.createdAt)}
                            </div>
                            <div className="lc-submission-actions">
                                {entry.hasPhoto && (
                                    <button
                                        className="lc-pill"
                                        onClick={() => openImage(photoUrl(entry.id), `${entry.problemTitle} — Photo`)}
                                    >
                                        Photo
                                    </button>
                                )}
                                {entry.hasCodeScreenshot && (
                                    <button
                                        className="lc-pill"
                                        onClick={() => openCodeFile(
                                            codeScreenshotUrl(entry.id),
                                            `${entry.problemTitle} — Code Solution`,
                                            entry.codeScreenshotContentType
                                        )}
                                    >
                                        Code Solution
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={lightbox.open}
                onClose={() => setLightbox({ open: false, src: "", title: "" })}
                title={lightbox.title}
                closeOnOverlayClick={true}
            >
                <img src={lightbox.src} alt={lightbox.title} className="lc-lightbox-img" />
            </Modal>

            <Modal
                isOpen={codeModal.open}
                onClose={() => setCodeModal({ open: false, content: "", title: "", copied: false })}
                title={codeModal.title}
                size="lg"
                closeOnOverlayClick={true}
            >
                <div className="lc-code-viewer-container">
                    <div className="lc-code-viewer-toolbar">
                        <span>Code Solution Content</span>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button
                                className="lc-code-action-btn"
                                onClick={() => {
                                    navigator.clipboard.writeText(codeModal.content);
                                    setCodeModal((prev) => ({ ...prev, copied: true }));
                                    setTimeout(() => setCodeModal((prev) => ({ ...prev, copied: false })), 2000);
                                }}
                            >
                                {codeModal.copied ? <><FaCheck size={12} /> Copied!</> : <><FaCopy size={12} /> Copy Code</>}
                            </button>
                            <button
                                className="lc-code-action-btn"
                                onClick={() => {
                                    const blob = new Blob([codeModal.content], { type: "text/plain" });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = `${codeModal.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
                                    document.body.appendChild(a);
                                    a.click();
                                    a.remove();
                                    setTimeout(() => URL.revokeObjectURL(url), 2000);
                                }}
                            >
                                <FaDownload size={12} /> Download
                            </button>
                        </div>
                    </div>
                    <pre className="lc-code-block">
                        <code>{codeModal.content}</code>
                    </pre>
                </div>
            </Modal>
        </MainLayout>
    );
}