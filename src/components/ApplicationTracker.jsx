import { useState, useEffect } from "react";
import {
    Building2, Briefcase, ExternalLink, Trash2, Edit2,
    Check, X, Filter, BarChart3, Clock, CheckCircle
} from "lucide-react";
import { getApplications, updateApplication, deleteApplication } from "../services/api";

const STATUS_OPTIONS = [
    { value: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'referred', label: 'Referred', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { value: 'interviewing', label: 'Interviewing', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { value: 'offer', label: 'Offer', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200' }
];

export default function ApplicationTracker({ onLoadApplication }) {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    // Fetch applications
    const fetchApplications = async () => {
        try {
            setLoading(true);
            const data = await getApplications(filter);
            setApplications(data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [filter]);

    // Handle status change
    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateApplication(id, { status: newStatus });
            setApplications(apps =>
                apps.map(app => app.id === id ? { ...app, status: newStatus } : app)
            );
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Handle edit
    const startEditing = (app) => {
        setEditingId(app.id);
        setEditData({
            company_name: app.company_name,
            job_title: app.job_title || '',
            application_link: app.application_link || ''
        });
    };

    const saveEdit = async (id) => {
        try {
            await updateApplication(id, editData);
            setApplications(apps =>
                apps.map(app => app.id === id ? { ...app, ...editData } : app)
            );
            setEditingId(null);
        } catch (error) {
            console.error('Error saving edit:', error);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData({});
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!confirm('Delete this application?')) return;
        try {
            await deleteApplication(id);
            setApplications(apps => apps.filter(app => app.id !== id));
        } catch (error) {
            console.error('Error deleting application:', error);
        }
    };

    // Get status style
    const getStatusStyle = (status) => {
        return STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-slate-100 text-slate-700';
    };

    // Get score color
    const getScoreColor = (score) => {
        if (!score) return 'text-slate-400';
        if (score >= 80) return 'text-emerald-600';
        if (score >= 60) return 'text-amber-500';
        return 'text-red-500';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Application Tracker</h2>
                    <p className="text-slate-500">Track and manage your job applications</p>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm focus:outline-none focus:border-emerald-500"
                    >
                        <option value="all">All Status</option>
                        {STATUS_OPTIONS.map(status => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 card-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{applications.length}</p>
                            <p className="text-xs text-slate-500">Total Applications</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 card-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">
                                {applications.filter(a => a.status === 'interviewing').length}
                            </p>
                            <p className="text-xs text-slate-500">Interviewing</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 card-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">
                                {applications.filter(a => a.status === 'offer').length}
                            </p>
                            <p className="text-xs text-slate-500">Offers</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 card-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">
                                {Math.round(applications.reduce((acc, a) => acc + (a.ats_score || 0), 0) / applications.length) || 0}%
                            </p>
                            <p className="text-xs text-slate-500">Avg ATS Score</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden card-shadow">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-10 h-10 mx-auto mb-4 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin"></div>
                        <p className="text-slate-500">Loading applications...</p>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-slate-600 font-medium mb-1">No Applications Yet</h3>
                        <p className="text-slate-400 text-sm">
                            Analyze and save resumes to track your applications
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Title</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Link</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {applications.map((app) => (
                                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            {editingId === app.id ? (
                                                <input
                                                    type="text"
                                                    value={editData.company_name}
                                                    onChange={(e) => setEditData({ ...editData, company_name: e.target.value })}
                                                    className="w-full px-2 py-1 rounded border border-slate-200 text-sm"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                        <Building2 className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                    <span className="font-medium text-slate-800">{app.company_name}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {editingId === app.id ? (
                                                <input
                                                    type="text"
                                                    value={editData.job_title}
                                                    onChange={(e) => setEditData({ ...editData, job_title: e.target.value })}
                                                    className="w-full px-2 py-1 rounded border border-slate-200 text-sm"
                                                />
                                            ) : (
                                                <span className="text-slate-600">{app.job_title || '-'}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`font-semibold ${getScoreColor(app.ats_score)}`}>
                                                {app.ats_score ? `${app.ats_score}%` : '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={app.status}
                                                onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                                className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusStyle(app.status)}`}
                                            >
                                                {STATUS_OPTIONS.map(status => (
                                                    <option key={status.value} value={status.value}>{status.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            {editingId === app.id ? (
                                                <input
                                                    type="url"
                                                    value={editData.application_link}
                                                    onChange={(e) => setEditData({ ...editData, application_link: e.target.value })}
                                                    className="w-full px-2 py-1 rounded border border-slate-200 text-sm"
                                                    placeholder="Add link"
                                                />
                                            ) : app.application_link ? (
                                                <a
                                                    href={app.application_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    Open
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-slate-500 text-sm">
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                {editingId === app.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => saveEdit(app.id)}
                                                            className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors"
                                                            title="Save"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                                                            title="Cancel"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => onLoadApplication(app)}
                                                            className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors"
                                                            title="Load Resume"
                                                        >
                                                            <Briefcase className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => startEditing(app)}
                                                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(app.id)}
                                                            className="p-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
