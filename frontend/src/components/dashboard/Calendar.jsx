import { useEffect, useState } from "react";
import CalendarBase from "react-calendar";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Loader from "../common/Loader";
import { dashboardService } from "../../api/dashboardService";
import "../../styles/dashboard.css";
import "react-calendar/dist/Calendar.css";

function pad(n) { return n < 10 ? `0${n}` : `${n}`; }
function toKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function Calendar({ onRefreshKey }) {
    const [value, setValue] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deadlines, setDeadlines] = useState({});
    const [leetcodes, setLeetcodes] = useState({});
    const [activeYearMonth, setActiveYearMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${now.getMonth() + 1}`;
    });

    function load(year, month, isInitial = false) {
        if (isInitial) setLoading(true);
        setError("");
        dashboardService.getCalendar(year, month)
            .then((data) => {
                const byDeadline = {};
                const byLeetcode = {};
                const list = Array.isArray(data) ? data : [];
                list.forEach((item) => {
                    const d = item.date;
                    if (!d) return;
                    const key = toKey(d);
                    const dl = item.topicDeadlineCount ?? item.deadlineCount ?? 0;
                    const lc = item.leetcodeCount ?? 0;
                    if (dl > 0) byDeadline[key] = dl;
                    if (lc > 0) byLeetcode[key] = lc;
                });
                if (data?.byDeadline && typeof data.byDeadline === "object") {
                    Object.assign(byDeadline, data.byDeadline);
                }
                if (data?.byLeetcode && typeof data.byLeetcode === "object") {
                    Object.assign(byLeetcode, data.byLeetcode);
                }
                setDeadlines(byDeadline);
                setLeetcodes(byLeetcode);
            })
            .catch((e) => setError(e.message || "Failed to load calendar."))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        const d = value instanceof Date ? value : new Date();
        load(d.getFullYear(), d.getMonth() + 1, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onRefreshKey]);

    const handleActiveStartDateChange = ({ activeStartDate }) => {
        if (!activeStartDate) return;
        const y = activeStartDate.getFullYear();
        const m = activeStartDate.getMonth() + 1;
        const key = `${y}-${m}`;
        if (key !== activeYearMonth) {
            setActiveYearMonth(key);
            load(y, m, false);
        }
    };

    function tileContent({ date }) {
        const key = toKey(date);
        const dl = deadlines[key] || 0;
        const lc = leetcodes[key] || 0;
        if (!dl && !lc) return null;
        return (
            <div className="cal-dots">
                {dl > 0 && (
                    <span className="cal-dot cal-dot-deadline" title={`${dl} deadline(s)`}>
                        {dl > 1 ? dl : ""}
                    </span>
                )}
                {lc > 0 && (
                    <span className="cal-dot cal-dot-leetcode" title={`${lc} LeetCode`}>
                        {lc > 1 ? lc : ""}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="card dashboard-calendar">
            <div className="section-title cal-title">
                <h3>Schedule Calendar</h3>
                <div className="cal-legend">
                    <span><i className="cal-dot cal-dot-deadline" /> Deadline</span>
                    <span><i className="cal-dot cal-dot-leetcode" /> LeetCode</span>
                </div>
            </div>

            {error && <div className="form-alert form-alert-error">{error}</div>}

            {loading ? (
                <Loader label="Loading calendar..." />
            ) : (
                <CalendarBase
                    onChange={setValue}
                    value={value}
                    onActiveStartDateChange={handleActiveStartDateChange}
                    tileContent={tileContent}
                    prevLabel={<FaChevronLeft size={13} />}
                    nextLabel={<FaChevronRight size={13} />}
                    prev2Label={null}
                    next2Label={null}
                    showNeighboringMonth={false}
                />
            )}
        </div>
    );
}