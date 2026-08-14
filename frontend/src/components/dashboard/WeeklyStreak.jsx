import { useEffect, useRef, useState, useCallback } from "react";
import { topicService } from "../../api/topicService";
import { getLeetcodeEntries } from "../../api/leetcodeService";
import "../../styles/streak.css";

// ── Helpers ──────────────────────────────────────────────────────────────────

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MOTIVATIONAL_MESSAGES = [
    "You're on fire! Keep it up! 🚀",
    "Another day, another win! 💪",
    "Consistency is your superpower!",
    "Progress > Perfection. Well done!",
    "Every step counts. You crushed it! ⚡",
    "That's how champions are built! 🏆",
    "Momentum earned. Don't stop now!",
];

function toDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/** Returns Monday of the current week as a Date */
function getMondayOfWeek(today = new Date()) {
    const d = new Date(today);
    const dow = d.getDay(); // 0=Sun
    d.setDate(d.getDate() - ((dow + 6) % 7));
    d.setHours(0, 0, 0, 0);
    return d;
}

/** Returns array of 7 Dates: Mon–Sun of this week */
function getWeekDays() {
    const monday = getMondayOfWeek();
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

/** Compute current streak: consecutive active days counting back from today */
function computeCurrentStreak(activeDates) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    const cursor = new Date(today);
    while (activeDates.has(toDateKey(cursor))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
}

/** Compute best streak across available active dates */
function computeBestStreak(activeDates) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let best = 0;
    let current = 0;
    // Look back 365 days max
    for (let i = 364; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        if (activeDates.has(toDateKey(d))) {
            current++;
            if (current > best) best = current;
        } else {
            current = 0;
        }
    }
    return best;
}

/** Build the set of active dates from topics + leetcode entries */
function buildActiveDates(topics, leetcodeEntries) {
    const dates = new Set();

    // Subtopic completions
    for (const topic of topics) {
        for (const sub of topic.subtopics || []) {
            if (sub.completedAt) {
                const key = sub.completedAt.split("T")[0];
                if (key) dates.add(key);
            }
        }
    }

    // LeetCode entries
    for (const entry of leetcodeEntries) {
        if (entry.entryDate) {
            // entryDate might be "2026-08-10" or an array [2026,8,10]
            const key = Array.isArray(entry.entryDate)
                ? `${entry.entryDate[0]}-${String(entry.entryDate[1]).padStart(2, "0")}-${String(entry.entryDate[2]).padStart(2, "0")}`
                : String(entry.entryDate).split("T")[0];
            if (key) dates.add(key);
        } else if (entry.createdAt) {
            const key = String(entry.createdAt).split("T")[0];
            if (key) dates.add(key);
        }
    }

    return dates;
}

// ── Confetti ─────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = [
    "#f97316", "#fbbf24", "#22c55e", "#3b82f6",
    "#a855f7", "#ec4899", "#06b6d4", "#84cc16",
];

function Confetti({ count = 60 }) {
    const pieces = Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: `${6 + Math.random() * 6}px`,
        duration: `${1.8 + Math.random() * 1.5}s`,
        delay: `${Math.random() * 0.8}s`,
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
    }));

    return (
        <div className="confetti-container">
            {pieces.map((p) => (
                <div
                    key={p.id}
                    className="confetti-piece"
                    style={{
                        left: p.left,
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        borderRadius: p.borderRadius,
                        animationDuration: p.duration,
                        animationDelay: p.delay,
                    }}
                />
            ))}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function WeeklyStreak({ onRefreshKey }) {
    const [activeDates, setActiveDates] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [celebration, setCelebration] = useState(null); // null | 'daily' | 'week'
    const [motivMsg, setMotivMsg] = useState("");

    const prevTodayActiveRef = useRef(null);   // was today active on last fetch?
    const prevWeekAllActiveRef = useRef(null); // was week complete on last fetch?
    const celebTimerRef = useRef(null);

    const weekDays = getWeekDays();
    const todayKey = toDateKey(new Date());

    const fetchData = useCallback(async () => {
        try {
            const [topics, leetResp] = await Promise.all([
                topicService.getAll(),
                getLeetcodeEntries(),
            ]);

            const entries = Array.isArray(leetResp?.data?.data)
                ? leetResp.data.data
                : Array.isArray(leetResp?.data)
                ? leetResp.data
                : [];

            const dates = buildActiveDates(topics, entries);
            setActiveDates(dates);
            return dates;
        } catch {
            return new Set();
        } finally {
            setLoading(false);
        }
    }, []);

    // Check whether to trigger a celebration after refreshKey changes
    useEffect(() => {
        fetchData().then((dates) => {
            const todayActive = dates.has(todayKey);
            const weekDone = weekDays.every((d) => dates.has(toDateKey(d)));

            // Determine if this is a new achievement
            const prevToday = prevTodayActiveRef.current;
            const prevWeek = prevWeekAllActiveRef.current;

            if (prevToday === false && todayActive) {
                // Today just became active → daily celebration
                if (prevWeek === false && weekDone) {
                    triggerCelebration("week");
                } else {
                    triggerCelebration("daily");
                }
            } else if (prevWeek === false && weekDone) {
                triggerCelebration("week");
            }

            prevTodayActiveRef.current = todayActive;
            prevWeekAllActiveRef.current = weekDone;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onRefreshKey]);

    function triggerCelebration(type) {
        const msg = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
        setMotivMsg(msg);
        setCelebration(type);
        clearTimeout(celebTimerRef.current);
        celebTimerRef.current = setTimeout(() => setCelebration(null), 3400);
    }

    // Computed values
    const currentStreak = computeCurrentStreak(activeDates);
    const bestStreak = computeBestStreak(activeDates);
    const weekActiveCount = weekDays.filter((d) => activeDates.has(toDateKey(d))).length;
    const weekProgressPct = Math.round((weekActiveCount / 7) * 100);

    if (loading) return null; // silent until data loads

    return (
        <>
            {/* ── Celebration overlay ── */}
            {celebration && (
                <>
                    <Confetti count={celebration === "week" ? 100 : 60} />
                    <div className="streak-celebration-overlay">
                        <div className={`streak-toast ${celebration === "week" ? "streak-toast-big" : ""}`}>
                            <div className="streak-toast-emoji">
                                {celebration === "week" ? "🏆" : "🔥"}
                            </div>
                            <p className="streak-toast-title">
                                {celebration === "week"
                                    ? "Week Complete! 🎉"
                                    : `${currentStreak}-Day Streak!`}
                            </p>
                            <p className="streak-toast-msg">
                                {celebration === "week"
                                    ? "You nailed all 7 days this week. Legendary! 🚀"
                                    : motivMsg}
                            </p>
                        </div>
                    </div>
                </>
            )}

            {/* ── Streak Card ── */}
            <div className="card streak-card">
                {/* Header */}
                <div className="streak-header">
                    <div className="streak-title">
                        <span className="streak-fire-emoji">🔥</span>
                        <h3>Weekly Learning Streak</h3>
                    </div>
                    <div className="streak-badge">
                        📅 {weekActiveCount}/7 days
                    </div>
                </div>

                {/* Stats row */}
                <div className="streak-stats">
                    <div className="streak-stat">
                        <span className="streak-stat-value streak-fire">{currentStreak}</span>
                        <span className="streak-stat-label">🔥 Current</span>
                    </div>
                    <div className="streak-stat">
                        <span className="streak-stat-value streak-trophy">{bestStreak}</span>
                        <span className="streak-stat-label">🏆 Best</span>
                    </div>
                    <div className="streak-stat">
                        <span className="streak-stat-value">{weekActiveCount}</span>
                        <span className="streak-stat-label">📅 This Week</span>
                    </div>
                </div>

                {/* Week label */}
                <div className="streak-week-label">This Week</div>

                {/* 7-day dot row */}
                <div className="streak-dots">
                    {weekDays.map((day, i) => {
                        const key = toDateKey(day);
                        const isToday = key === todayKey;
                        const isActive = activeDates.has(key);
                        const isFuture = day > new Date() && !isToday;
                        const isMissed = !isToday && !isFuture && !isActive;

                        let dotClass = "streak-dot";
                        if (isActive) dotClass += " is-active";
                        if (isToday) dotClass += " is-today";
                        if (isMissed) dotClass += " is-missed";
                        if (isFuture) dotClass += " is-future";

                        return (
                            <div key={key} className="streak-dot-wrap">
                                <div className={dotClass} title={key}>
                                    {isActive ? "✓" : isToday ? "⬤" : isMissed ? "✕" : ""}
                                </div>
                                <span
                                    className={`streak-dot-day${isToday ? " is-today-label" : ""}`}
                                >
                                    {DAY_LABELS[i]}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Progress bar */}
                <div className="streak-progress-row">
                    <div className="streak-progress-bar">
                        <div
                            className="streak-progress-fill"
                            style={{ width: `${weekProgressPct}%` }}
                        />
                    </div>
                    <span className="streak-progress-text">{weekProgressPct}% of week</span>
                </div>
            </div>
        </>
    );
}
