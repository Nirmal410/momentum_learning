import { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import api from "../../api/api";
import TopicTypeahead from "./TopicTypeahead";
import Loader from "../common/Loader";

export default function AddTopicModal({ show, onClose, onCreated, prefilledTitle = "" }) {
    const [title, setTitle] = useState(prefilledTitle);
    const [categoryId, setCategoryId] = useState(null);
    const [subtopic, setSubtopic] = useState({
        title: "",
        notes: "",
        file: null,
        filePreview: null
    });
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState("");

    const fileInputRef = useRef(null);

    const resetForm = () => {
        setTitle("");
        setCategoryId(null);
        setSubtopic({
            title: "",
            notes: "",
            file: null,
            filePreview: null
        });
        setError("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!title.trim()) {
            setError("Please select a topic.");
            return;
        }

        const data = new FormData();
        data.append("title", title.trim());
        if (categoryId) data.append("categoryId", categoryId);
        if (subtopic.title.trim()) data.append("subtopics[0].title", subtopic.title.trim());
        if (subtopic.notes.trim()) data.append("subtopics[0].notes", subtopic.notes.trim());
        if (subtopic.file) data.append("subtopics[0].file", subtopic.file);

        try {
            setIsAdding(true);
            await api.post("/topics", data);
            resetForm();
            onClose();
            if (onCreated) onCreated();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add topic");
        } finally {
            setIsAdding(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSubtopic({
            ...subtopic,
            file,
            filePreview: URL.createObjectURL(file)
        });
    };

    if (!show) return null;

    return (
        <Modal show={show} onClose={() => { onClose(); resetForm(); }} title="Add New Topic">
            <form onSubmit={handleSubmit} className="add-topic-form">
                <div className="form-group">
                    <label>Topic</label>
                    <TopicTypeahead
                        value={title}
                        onChange={setTitle}
                        onSelectCategory={setCategoryId}
                        placeholder="Search or create a new topic"
                    />
                </div>

                <div className="form-group">
                    <label>First Subtopic</label>
                    <input
                        type="text"
                        value={subtopic.title}
                        onChange={(e) => setSubtopic({ ...subtopic, title: e.target.value })}
                        placeholder="e.g., Introduction to Recursion"
                    />
                </div>

                <div className="form-group">
                    <label>Notes / Summary</label>
                    <textarea
                        value={subtopic.notes}
                        onChange={(e) => setSubtopic({ ...subtopic, notes: e.target.value })}
                        placeholder="Key concepts, takeaways..."
                    />
                </div>

                <div className="form-group">
                    <label>File (Optional)</label>
                    <div className="file-input">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
                        />
                        <span>Choose File</span>
                        {subtopic.filePreview && (
                            <a href={subtopic.filePreview} target="_blank" rel="noopener noreferrer">
                                {subtopic.file.name}
                            </a>
                        )}
                    </div>
                </div>

                {error && <p className="error-message">{error}</p>}

                <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={() => { onClose(); resetForm(); }}>
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={isAdding}>
                        {isAdding ? <Loader size={16} /> : <FaPlus size={14} />}
                        Create Topic
                    </button>
                </div>
            </form>
        </Modal>
    );
}