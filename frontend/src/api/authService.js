import api from "./api";

export const signup = (formData) => {
    return api.post("/auth/signup", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};

export const login = (data) => {
    return api.post("/auth/login", data);
};

export const logout = () => {
    return api.post("/auth/logout");
};

export const currentUser = () => {
    return api.get("/auth/me");
};