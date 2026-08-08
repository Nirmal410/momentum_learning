import { useState } from "react";
import { FaPlus, FaTrash, FaCheck } from "react-icons/fa";
import Modal from "../common/Modal";
import Loader from "../common/Loader";
import { topicService } from "../../api/topicService";
import "../../styles/dashboard.css";

export default function AddTopicModal({ isOpen, onClose, onSuccess }) {
    const [name, setName] = useState("");
    const [deadline, setDeadline] = useState("");
    const [subtopics, setSubtopics] = useState([{ name: "", completed: false }]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    function resetForm() {
        setName("");
        setDeadline("");
        setSubtopics([{ name: "", completed: false }]);
        setError("");
        setSubmitting(false);
    }

    function handleClose() {
        resetForm();
        onClose();
    }

    function addSubtopic() {
        setSubtopics((prev) => [...prev, { name: "", completed: false }]);
    }

    function removeSubtopic(idx) {
        setSubtopics((prev) => prev.filter((_, i) => i !== idx));
    }

    function updateSubtopic(idx, key, val) {
        setSubtopics((prev) =>
            prev.map((s, i) => (i === idx ? { ...s, [key]: val } : s))
        );
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        // Validation
        if (!name.trim()) {
            setError("Topic name is required.");
            return;
        }
        if (!deadline) {
            setError("Deadline is required.");
            return;
        }
        const validSubs = subtopics.filter((s) => s.name.trim());
        if (validSubs.length === 0) {
            setError("Please add at least one subtopic.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                name: name.trim(),
                deadline: deadline,
                subtopics: validSubs.map((s) => ({
                    name: s.name.trim(),
                    completed: !!s.completed
                }))
            };
            await topicService.create(payload);
            if (onSuccess) onSuccess();
            handleClose();
        } catch (err) {
            setError(err.message || "Failed to create topic.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add New Topic">
            <form className="add-topic-form" onSubmit={handleSubmit}>
                {error && (
                    <div className="form-alert form-alert-error">{error}</div>
                )}

                <div className="field">
                    <label>Topic Name</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="e.g. Data Structures & Algorithms"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={submitting}
                    />
                </div>

                <div className="field">
                    <label>Deadline</label>
                    <input
                        type="date"
                        className="input"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        disabled={submitting}
                    />
                </div>

                <div className="field">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <label>Subtopics</label>
                        <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={addSubtopic}
                            disabled={submitting}
                        >
                            <FaPlus size={11} /> Add
                        </button>
                    </div>

                    <div className="subtopics-list">
                        {subtopics.map((sub, idx) => (
                            <div key={idx} className="subtopic-row">
                                <button
                                    type="button"
                                    className={`subtopic-tick ${sub.completed ? "checked" : ""}`}
                                    onClick={() =>
                                        updateSubtopic(idx, "completed", !sub.completed)
                                    }
                                    disabled={submitting}
                                    aria-label="Toggle completed"
                                >
                                    {sub.completed && <FaCheck size={11} />}
                                </button>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder={`Subtopic ${idx + 1}`}
                                    value={sub.name}
                                    onChange={(e) =>
                                        updateSubtopic(idx, "name", e.target.value)
                                    }
                                    disabled={submitting}
                                />
                                {subtopics.length > 1 && (
                                    <button
                                        type="button"
                                        className="subtopic-remove"
                                        onClick={() => removeSubtopic(idx)}
                                        disabled={submitting}
                                        aria-label="Remove subtopic"
                                    >
                                        <FaTrash size={13} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {submitting ? (
                    <Loader label="Creating topic..." />
                ) : (
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={handleClose}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                        >
                            <FaPlus size={13} /> Create Topic
                        </button>
                    </div>
                )}
            </form>
        </Modal>
    );
}