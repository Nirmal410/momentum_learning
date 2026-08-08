import "../../styles/dashboard.css";

export default function StatCard({
    title,
    value,
    icon,
    variant = "default",
    trend
}) {
    const variantClass = `stat-card-${variant}`;

    return (
        <div className={`card stat-card ${variantClass}`}>
            <div className="stat-card-top">
                {icon && <div className="stat-icon">{icon}</div>}
                <h4>{title}</h4>
            </div>
            <div className="stat-card-bottom">
                <h1 className="stat-value">{value}</h1>
                {trend && (
                    <span className={`stat-trend stat-trend-${trend > 0 ? "up" : "down"}`}>
                        {trend > 0 ? "▲" : "▼"} {Math.abs(trend)}%
                    </span>
                )}
            </div>
        </div>
    );
}