import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import AuthProvider from "./context/AuthContext";
import AddTopicModalProvider from "./context/AddTopicModalContext";
import ThemeProvider from "./context/ThemeContext";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AuthProvider>
            <ThemeProvider>
                <AddTopicModalProvider>
                    <App />
                </AddTopicModalProvider>
            </ThemeProvider>
        </AuthProvider>
    </React.StrictMode>
);