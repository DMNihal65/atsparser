import { useState, useEffect } from "react";
import {
    Target, Calendar, ChevronLeft, ChevronRight,
    CheckCircle, Circle, TrendingUp, Award
} from "lucide-react";
import { getGoals, getTodayGoal, updateGoal } from "../services/api";

export default function GoalTracker() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [goals, setGoals] = useState([]);
    const [todayGoal, setTodayGoal] = useState({ target: 10, achieved: 0 });
    const [loading, setLoading] = useState(true);

    // Get month data
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    // Calculate days in month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Fetch goals
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const startDate = new Date(year, month, 1).toISOString().split('T')[0];
                const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

                const [goalsData, todayData] = await Promise.all([
                    getGoals(startDate, endDate),
                    getTodayGoal()
                ]);

                setGoals(goalsData);
                setTodayGoal(todayData);
            } catch (error) {
                console.error('Error fetching goals:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [year, month]);

    // Get goal for a specific day
    const getGoalForDay = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return goals.find(g => g.goal_date === dateStr);
    };

    // Navigation
    const previousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    // Update target
    const handleTargetChange = async (newTarget) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            await updateGoal({ goal_date: today, target: newTarget, achieved: todayGoal.achieved });
            setTodayGoal({ ...todayGoal, target: newTarget });
        } catch (error) {
            console.error('Error updating target:', error);
        }
    };

    // Calculate stats
    const monthlyTotal = goals.reduce((acc, g) => acc + (g.achieved || 0), 0);
    const daysWithGoalMet = goals.filter(g => g.achieved >= g.target).length;
    const progressPercent = todayGoal.target > 0
        ? Math.min(100, (todayGoal.achieved / todayGoal.target) * 100)
        : 0;

    // Generate calendar days
    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    const today = new Date();
    const isToday = (day) => {
        return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    };

    const isPast = (day) => {
        const date = new Date(year, month, day);
        return date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Daily Goals</h2>
                <p className="text-slate-500">Track your daily application targets</p>
            </div>

            {/* Today's Progress */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 card-shadow">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <Target className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">Today's Progress</h3>
                            <p className="text-sm text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Daily Target:</span>
                        <select
                            value={todayGoal.target}
                            onChange={(e) => handleTargetChange(parseInt(e.target.value))}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium focus:outline-none focus:border-emerald-500"
                        >
                            {[5, 10, 15, 20, 25, 30].map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex items-end justify-between mb-2">
                        <span className="text-4xl font-bold text-slate-800">{todayGoal.achieved}</span>
                        <span className="text-slate-500">of {todayGoal.target} applications</span>
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${progressPercent >= 100 ? 'bg-emerald-500' : 'bg-emerald-400'
                                }`}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {progressPercent >= 100 && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <span className="text-emerald-700 font-medium">Goal achieved! Great job! 🎉</span>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 card-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{monthlyTotal}</p>
                            <p className="text-xs text-slate-500">This Month</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 card-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <Award className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{daysWithGoalMet}</p>
                            <p className="text-xs text-slate-500">Goals Met</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 card-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">
                                {monthlyTotal > 0 ? Math.round(monthlyTotal / Math.max(1, daysWithGoalMet + goals.filter(g => g.achieved > 0 && g.achieved < g.target).length)) : 0}
                            </p>
                            <p className="text-xs text-slate-500">Avg/Day</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 card-shadow">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={previousMonth}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-lg font-semibold text-slate-800">
                        {monthName} {year}
                    </h3>
                    <button
                        onClick={nextMonth}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs font-medium text-slate-400 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                {loading ? (
                    <div className="py-12 text-center">
                        <div className="w-8 h-8 mx-auto rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((day, index) => {
                            if (day === null) {
                                return <div key={index} className="aspect-square" />;
                            }

                            const goal = getGoalForDay(day);
                            const achieved = goal?.achieved || 0;
                            const target = goal?.target || 10;
                            const isMet = achieved >= target;
                            const hasActivity = achieved > 0;

                            return (
                                <div
                                    key={index}
                                    className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${isToday(day)
                                            ? 'bg-emerald-500 text-white ring-2 ring-emerald-300 ring-offset-2'
                                            : isPast(day)
                                                ? isMet
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : hasActivity
                                                        ? 'bg-amber-50 text-amber-700'
                                                        : 'bg-slate-50 text-slate-400'
                                                : 'bg-slate-50 text-slate-600'
                                        }`}
                                >
                                    <span className="text-sm font-medium">{day}</span>
                                    {isPast(day) && hasActivity && (
                                        <span className="text-[10px] mt-0.5">
                                            {isMet ? <CheckCircle className="w-3 h-3" /> : achieved}
                                        </span>
                                    )}
                                    {isToday(day) && (
                                        <span className="text-[10px] mt-0.5 font-medium">
                                            {achieved}/{target}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-emerald-100" />
                        <span className="text-xs text-slate-500">Goal Met</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-amber-50" />
                        <span className="text-xs text-slate-500">Partial</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-slate-50 border border-slate-200" />
                        <span className="text-xs text-slate-500">No Activity</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
