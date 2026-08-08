import "../../styles/globals.css";

export default function Button({ children, variant = "primary", loading = false, ...props }) {
    return (
        <button
            className={`btn btn-${variant}`}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading ? "Please wait..." : children}
        </button>
    );
}