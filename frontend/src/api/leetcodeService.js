import api, { API_BASE_URL } from "./api";

export const addLeetcodeEntry = (formData) => {
    return api.post("/leetcode", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};

export const getLeetcodeEntries = () => {
    return api.get("/leetcode");
};

export const getLeetcodeStreak = () => {
    return api.get("/leetcode/streak");
};

export const deleteLeetcodeEntry = (id) => {
    return api.delete(`/leetcode/${id}`);
};

export const photoUrl = (id) => `${API_BASE_URL}/leetcode/${id}/photo`;
export const codeScreenshotUrl = (id) => `${API_BASE_URL}/leetcode/${id}/code-screenshot`;