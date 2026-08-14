import { useContext } from "react";
import { FaCode, FaChartLine, FaHistory, FaCog, FaQuestionCircle, FaPlus, FaTachometerAlt, FaUserShield } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useAddTopicModal } from "../../context/AddTopicModalContext";

import "../../styles/layout.css";

export default function Sidebar({ onAddTopic }) {
    const { user } = useContext(AuthContext);
    const { openModal } = useAddTopicModal();

    const menu = [
        { title: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
        { title: "Problem Solving", icon: <FaCode />, path: "/leetcode" },
        { title: "Progress", icon: <FaChartLine />, path: "/progress" },
        { title: "History", icon: <FaHistory />, path: "/history" },
    ];

    if (user?.role === "ADMIN") {
        menu.push({ title: "Admin Portal", icon: <FaUserShield />, path: "/admin" });
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-top">
                <div className="sidebar-header">
                    <h2>Track Progress</h2>
                    <p>Stay consistent{user ? `, ${user.name.split(" ")[0]}` : ""}.</p>
                </div>
                <button
                    className="btn btn-primary sidebar-add-btn"
                    onClick={() => {
                        if (typeof onAddTopic === "function") onAddTopic();
                        else openModal();
                    }}
                >
                    <FaPlus size={13} /> Add Topic
                </button>
            </div>

            <nav className="sidebar-nav">
                {menu.map((item) => (
                    <NavLink
                        key={item.title}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? "active" : ""}`
                        }
                    >
                        {item.icon}
                        <span>{item.title}</span>
                    </NavLink>
                ))}

                <div className="sidebar-divider" />
            </nav>

            <div className="sidebar-footer">
                <button
                    type="button"
                    className="sidebar-link"
                    onClick={() => alert("Settings page coming soon.")}
                >
                    <FaCog />
                    <span>Settings</span>
                </button>
                <button
                    type="button"
                    className="sidebar-link"
                    onClick={() => alert("Help & docs coming soon.")}
                >
                    <FaQuestionCircle />
                    <span>Help</span>
                </button>
            </div>
        </aside>
    );
}
