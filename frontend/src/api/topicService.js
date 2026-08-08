import api from "./api";

function unwrap(resp) {
    const { success, message, data } = resp.data;
    if (!success) throw new Error(message || "Topic request failed.");
    return data;
}

function normalizeSubtopic(sub) {
    if (!sub) return sub;
    const s = { ...sub };
    if (s.name == null && s.title != null) s.name = s.title;
    if (s.title == null && s.name != null) s.title = s.name;
    return s;
}

function normalizeTopic(t) {
    if (!t) return t;
    const topic = { ...t };
    if (topic.name == null && topic.title != null) topic.name = topic.title;
    if (topic.title == null && topic.name != null) topic.title = topic.name;
    if (Array.isArray(topic.subtopics)) {
        topic.subtopics = topic.subtopics.map(normalizeSubtopic);
    }
    return topic;
}

function normalizeTopicList(list) {
    if (!Array.isArray(list)) return list;
    return list.map(normalizeTopic);
}

export const topicService = {
    // GET /api/topics -> list all topics with subtopics
    async getAll() {
        const resp = await api.get("/topics");
        const data = unwrap(resp);
        return normalizeTopicList(data);
    },

    // GET /api/topics/{id}
    async getById(id) {
        const resp = await api.get(`/topics/${id}`);
        return normalizeTopic(unwrap(resp));
    },

    // POST /api/topics -> create topic with subtopics (JSON body)
    // Backend TopicRequest: { title, category?, deadline, subtopicTitles: String[] }
    async create(payload) {
        const subtopics = Array.isArray(payload.subtopics) ? payload.subtopics : [];
        const body = {
            title: payload.title || payload.name,
            category: payload.category || null,
            deadline: payload.deadline || null,
            subtopicTitles: subtopics.map((s) =>
                typeof s === "string" ? s : (s?.title || s?.name || "")
            ).filter(Boolean)
        };
        const resp = await api.post("/topics", body);
        return normalizeTopic(unwrap(resp));
    },

    // PUT /api/topics/{id}
    async update(id, payload) {
        const resp = await api.put(`/topics/${id}`, payload);
        return normalizeTopic(unwrap(resp));
    },

    // DELETE /api/topics/{id}
    async delete(id) {
        const resp = await api.delete(`/topics/${id}`);
        return unwrap(resp);
    },

    // PATCH /api/topics/{topicId}/subtopics/{subtopicId}/toggle
    async toggleSubtopic(topicId, subtopicId) {
        const resp = await api.patch(`/topics/${topicId}/subtopics/${subtopicId}/toggle`);
        return normalizeTopic(unwrap(resp));
    },

    // POST /api/topics/{topicId}/subtopics/{subtopicId}/notes (multipart: file, notes optional)
    async uploadSubtopicNotes(topicId, subtopicId, formData) {
        // Backend SubtopicNotesRequest expects MultipartFile field named "file"
        // and optional String field "notes"
        const normalized = new FormData();
        if (formData.has("notesFile")) {
            normalized.append("file", formData.get("notesFile"));
        }
        if (formData.has("file")) {
            normalized.append("file", formData.get("file"));
        }
        if (formData.has("textNotes")) {
            normalized.append("notes", formData.get("textNotes"));
        }
        if (formData.has("notes")) {
            normalized.append("notes", formData.get("notes"));
        }
        const resp = await api.post(
            `/topics/${topicId}/subtopics/${subtopicId}/notes`,
            normalized,
            {
                headers: { "Content-Type": "multipart/form-data" }
            }
        );
        return normalizeTopic(unwrap(resp));
    },

    // GET /api/topics/{topicId}/subtopics/{subtopicId}/notes-file -> blob for download
    async getSubtopicNotes(topicId, subtopicId) {
        const resp = await api.get(
            `/topics/${topicId}/subtopics/${subtopicId}/notes-file`,
            { responseType: "blob" }
        );
        return resp.data;
    }
};

export default topicService;