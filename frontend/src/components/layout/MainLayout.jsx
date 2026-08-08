import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import AddTopicModal from "../dashboard/AddTopicModal";
import { useAddTopicModal } from "../../context/AddTopicModalContext";

import "../../styles/layout.css";

export default function MainLayout({ children }) {
    const modal = useAddTopicModal();

    return (
        <div className="layout">
            <Sidebar />

            <div className="main">
                <Navbar />

                <div className="content">
                    {children}
                </div>
            </div>

            <AddTopicModal
                isOpen={modal.open}
                onClose={modal.closeModal}
                onSuccess={() => modal.notifyCreated()}
            />
        </div>
    );
}