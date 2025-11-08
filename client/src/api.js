import axios from "axios";
const BASE = process.env.REACT_APP_API || "http://localhost:5000/api";

function authHeaders() {
  const token = localStorage.getItem("flowos_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// auth
export const register = (body) =>
  axios.post(`${BASE}/auth/register`, body).then((r) => r.data);
export const login = (body) =>
  axios.post(`${BASE}/auth/login`, body).then((r) => r.data);

// tasks
export const fetchTasks = () =>
  axios.get(`${BASE}/tasks`, { headers: authHeaders() }).then((r) => r.data);

// create task
export const createTask = (body) =>
  axios
    .post(`${BASE}/tasks`, body, { headers: authHeaders() })
    .then((r) => r.data);

// update task
export async function updateTask(id, data) {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// complete/open task
export const toggleTask = (id) =>
  axios
    .patch(`${BASE}/tasks/${id}/toggle`, {}, { headers: authHeaders() })
    .then((r) => r.data);

// delete task
export const deleteTask = (id) =>
  axios
    .delete(`${BASE}/tasks/${id}`, { headers: authHeaders() })
    .then((r) => r.data);

// add subtask
export const addSubtask = async (taskId, subtask) => {
  const res = await fetch(`/api/tasks/subtask/${taskId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subtask),
  });
  return await res.json();
};

// toggle subtask
export const toggleSubtask = (id, idx) =>
  axios
    .patch(
      `${BASE}/tasks/${id}/subtasks/${idx}/toggle`,
      {},
      { headers: authHeaders() }
    )
    .then((r) => r.data);

// avatars
export const fetchAvatars = () =>
  axios.get(`${BASE}/avatars`, { headers: authHeaders() }).then((r) => r.data);

// ai placeholder
export const aiSummarize = (text) =>
  axios
    .post(`${BASE}/ai/ai-extract`, { text }, { headers: authHeaders() })
    .then((r) => r.data);
