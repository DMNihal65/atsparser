const API_BASE = 'http://localhost:3001/api';

// =====================
// APPLICATIONS API
// =====================

export async function getApplications(status = 'all') {
    const url = status === 'all'
        ? `${API_BASE}/applications`
        : `${API_BASE}/applications?status=${status}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch applications');
    return response.json();
}

export async function getApplication(id) {
    const response = await fetch(`${API_BASE}/applications/${id}`);
    if (!response.ok) throw new Error('Failed to fetch application');
    return response.json();
}

export async function createApplication(data) {
    const response = await fetch(`${API_BASE}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create application');
    return response.json();
}

export async function updateApplication(id, data) {
    const response = await fetch(`${API_BASE}/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update application');
    return response.json();
}

export async function deleteApplication(id) {
    const response = await fetch(`${API_BASE}/applications/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete application');
    return response.json();
}

// =====================
// GOALS API
// =====================

export async function getGoals(start, end) {
    let url = `${API_BASE}/goals`;
    if (start && end) {
        url += `?start=${start}&end=${end}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch goals');
    return response.json();
}

export async function getTodayGoal() {
    const response = await fetch(`${API_BASE}/goals/today`);
    if (!response.ok) throw new Error('Failed to fetch today\'s goal');
    return response.json();
}

export async function updateGoal(data) {
    const response = await fetch(`${API_BASE}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update goal');
    return response.json();
}

// =====================
// STATS API
// =====================

export async function getStats() {
    const response = await fetch(`${API_BASE}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
}
