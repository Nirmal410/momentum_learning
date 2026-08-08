import { useEffect, useRef, useState, useContext } from "react";
import { FaGraduationCap, FaSearch, FaCog, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { logout as logoutApi, currentUser } from "../../api/authService";

import "../../styles/layout.css";

export default function Navbar() {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const ref = useRef(null);

    // optional: refresh user so profile picture is available in context state
    useEffect(() => {
        if (user && !avatarUrl) {
            currentUser()
                .then((res) => {
                    const u = res?.data?.data;
                    if (u?.profilePicture) {
                        setAvatarUrl(
                            typeof u.profilePicture === "string"
                                ? u.profilePicture
                                : dataUrlFromBlob(u.profilePicture)
                        );
                    }
                })
                .catch(() => {});
        }
    }, [user]);

    useEffect(() => {
        const onClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
        };
        if (menuOpen) document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [menuOpen]);

    const initials = (user?.name || "ML")
        .split(" ")
        .filter(Boolean)
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const pages = [
        { title: "Dashboard", path: "/dashboard" },
        { title: "LeetCode", path: "/leetcode" },
        { title: "Progress", path: "/progress" },
        { title: "History", path: "/history" },
    ];

    const handleLogout = async () => {
        setMenuOpen(false);
        try { await logoutApi(); } catch (_) {}
        localStorage.removeItem("token");
        setUser(null);
        navigate("/", { replace: true });
    };

    return (
        <header className="navbar">
            <NavLink to="/dashboard" className="navbar-logo" aria-label="Home">
                <FaGraduationCap size={20} />
                <span>Momentum Learning</span>
            </NavLink>

            <nav className="navbar-pages" aria-label="Main">
                {pages.map((p) => (
                    <NavLink
                        key={p.path}
                        to={p.path}
                        className={({ isActive }) =>
                            `navbar-page ${isActive ? "active" : ""}`
                        }
                    >
                        {p.title}
                    </NavLink>
                ))}
            </nav>

            <div className="navbar-spacer" />

            <div className="navbar-search">
                <FaSearch />
                <input
                    type="search"
                    placeholder="Search…"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            alert("Global search coming soon: " + e.target.value);
                        }
                    }}
                />
            </div>

            <div className="navbar-profile" ref={ref}>
                <button
                    className="avatar-btn"
                    onClick={() => setMenuOpen((o) => !o)}
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                >
                    <span className="avatar-btn-name">{user?.name}</span>
                    <div className="avatar" aria-hidden="true">
                        {avatarUrl ? <img src={avatarUrl} alt="" /> : initials}
                    </div>
                </button>

                {menuOpen && (
                    <div className="profile-dropdown" role="menu">
                        <div className="profile-header">
                            <strong>{user?.name || "Guest"}</strong>
                            <span>{user?.email || ""}</span>
                        </div>
                        <button
                            className="profile-item"
                            onClick={() => {
                                setMenuOpen(false);
                                alert("Profile details page coming soon.");
                            }}
                            role="menuitem"
                        >
                            <FaUserCircle size={14} /> Profile
                        </button>
                        <button
                            className="profile-item"
                            onClick={() => {
                                setMenuOpen(false);
                                alert("Settings page coming soon.");
                            }}
                            role="menuitem"
                        >
                            <FaCog size={14} /> Settings
                        </button>
                        <button
                            className="profile-item danger"
                            onClick={handleLogout}
                            role="menuitem"
                        >
                            <FaSignOutAlt size={14} /> Log out
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}

function dataUrlFromBlob(picture) {
    try {
        if (!picture) return null;
        if (typeof picture === "string") return picture.startsWith("data:") ? picture : null;
        if (picture instanceof Blob) return URL.createObjectURL(picture);
        if (Array.isArray(picture) && picture.every((n) => typeof n === "number")) {
            const blob = new Blob([new Uint8Array(picture)]);
            return URL.createObjectURL(blob);
        }
        return null;
    } catch {
        return null;
    }
}
