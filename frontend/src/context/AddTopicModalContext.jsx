import { createContext, useCallback, useContext, useState } from "react";

const AddTopicModalContext = createContext(null);

export function useAddTopicModal() {
    const ctx = useContext(AddTopicModalContext);
    if (!ctx) {
        // Fallback so <ProtectedRoute> outer components don't crash before provider mount
        return {
            open: false,
            openModal: () => {},
            closeModal: () => {},
            notifyCreated: () => {},
            setOnCreated: () => {}
        };
    }
    return ctx;
}

export default function AddTopicModalProvider({ children }) {
    const [open, setOpen] = useState(false);
    const [onCreated, setOnCreated] = useState(null);

    const openModal = useCallback(() => setOpen(true), []);
    const closeModal = useCallback(() => setOpen(false), []);

    const notifyCreated = useCallback(() => {
        try {
            if (typeof onCreated === "function") onCreated();
        } catch (_) { /* noop */ }
    }, [onCreated]);

    const value = {
        open,
        openModal,
        closeModal,
        notifyCreated,
        setOnCreated
    };

    return (
        <AddTopicModalContext.Provider value={value}>
            {children}
        </AddTopicModalContext.Provider>
    );
}