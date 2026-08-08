import { useEffect, useRef, useState } from "react";
import { FaCamera, FaDesktop, FaCode } from "react-icons/fa";
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

    const [lightbox, setLightbox] = useState({ open: false, src: "", title: "" });

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
        setCodeScreenshotPreview(URL.createObjectURL(file));
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

    const visibleEntries = showAll ? entries : entries.slice(0, 5);

    return (
        <MainLayout>
            <div className="lc-header">
                <div>
                    <h1>Daily Tracker</h1>
                    <p>Log your daily coding exercises to maintain your streak.</p>
                </div>
                <div className="lc-streak">
                    Streak: <strong>{streak}</strong> Day{streak === 1 ? "" : "s"}
                </div>
            </div>

            <form className="lc-card" onSubmit={handleSubmit}>
                <h3>Log Today's Progress</h3>

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
                        <div className="lc-upload-box" onClick={() => photoInputRef.current.click()}>
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
                        <label className="lc-label">Code Screenshot</label>
                        <div className="lc-upload-box" onClick={() => screenshotInputRef.current.click()}>
                            {codeScreenshotPreview ? (
                                <img src={codeScreenshotPreview} alt="Code preview" />
                            ) : (
                                <>
                                    <FaDesktop size={28} />
                                    <span>Click to upload screenshot</span>
                                </>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/png, image/jpeg"
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
                {success && <p className="lc-success">{success}</p>}

                <button type="submit" className="lc-submit" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Entry"}
                </button>
            </form>

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
                                        onClick={() => openImage(codeScreenshotUrl(entry.id), `${entry.problemTitle} — Code`)}
                                    >
                                        Code
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
            >
                <img src={lightbox.src} alt={lightbox.title} className="lc-lightbox-img" />
            </Modal>
        </MainLayout>
    );
}