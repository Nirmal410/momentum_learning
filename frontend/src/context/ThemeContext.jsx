import { createContext, useContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export default function ThemeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem("app_theme");
        if (saved) return saved === "dark";
        return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-theme");
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("app_theme", "dark");
        } else {
            document.body.classList.remove("dark-theme");
            document.documentElement.setAttribute("data-theme", "light");
            localStorage.setItem("app_theme", "light");
        }
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode((prev) => !prev);
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
