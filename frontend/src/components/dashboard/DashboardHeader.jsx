import { useContext } from "react";
import { FaPlus } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/dashboard.css";

function getGreeting() {
    const h = new Date().getHours();
    if (h < 5) return "Still up";
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Good night";
}

export default function DashboardHeader({ onAdd }) {
    const { user } = useContext(AuthContext);
    const firstName = user?.name ? user.name.split(" ")[0] : null;

    return (
        <div className="page-header">
            <div>
                <h1>Dashboard</h1>
                <p>
                    {getGreeting()}{firstName ? `, ${firstName}` : ""}. 
                    Track your learning journey.
                </p>
            </div>
            <button className="btn btn-primary" onClick={onAdd}>
                <FaPlus size={13} /> Add Topic
            </button>
        </div>
    );
}
