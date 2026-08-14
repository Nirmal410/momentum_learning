import "../../styles/globals.css";

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = "md",
    closeOnOverlayClick = false
}) {

    if (!isOpen) return null;

    const sizeClass = size ? `modal-box-${size}` : "";

    const handleOverlayClick = () => {
        if (closeOnOverlayClick && onClose) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className={`modal-box ${sizeClass}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}