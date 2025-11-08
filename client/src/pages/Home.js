import React, { useState, useEffect, useRef } from "react";
import {
  fetchTasks,
  fetchAvatars,
  createTask,
  toggleTask,
  deleteTask,
  toggleSubtask,
  updateTask,
} from "../api";
import TaskModal from "./TaskModal";

export default function Home({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [avatars, setAvatars] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [deadline, setDeadline] = useState("");
  const [subtasks, setSubtasks] = useState([{ title: "" }]);
  const [dopamine, setDopamine] = useState(null);

  const recognitionRef = useRef(null);

  useEffect(() => {
    loadAll();

    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognitionRef.current = recognition;
    }
  }, []);

  async function loadAll() {
    setTasks(await fetchTasks());
    setAvatars(await fetchAvatars());
  }

  function startVoiceInput(forTask = true, subIdx = null) {
    if (!recognitionRef.current) return;
    recognitionRef.current.start();
    recognitionRef.current.onresult = (event) => {
      const text = event.results[0][0].transcript;
      if (forTask) setTitle(text);
      else if (subIdx !== null) {
        const copy = [...subtasks];
        copy[subIdx].title = text;
        setSubtasks(copy);
      } else {
        const copy = [...subtasks];
        copy[copy.length - 1].title = text;
        setSubtasks(copy);
      }
    };
  }

  function openModal(task = null) {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setDesc(task.desc || "");
      setPriority(task.priority || "Medium");
      setDeadline(task.deadline || "");
      setSubtasks(task.subtasks?.length ? task.subtasks : [{ title: "" }]);
    } else {
      setEditingTask(null);
      setTitle("");
      setDesc("");
      setPriority("Medium");
      setDeadline("");
      setSubtasks([{ title: "" }]);
    }
    setShowModal(true);
  }

  async function saveTask(taskData) {
    console.log("Saving task:", taskData);

    if (editingTask) await updateTask(editingTask._id, taskData);
    else await createTask(taskData);
    setShowModal(false);
    loadAll();
  }

  async function handleToggle(id) {
    const res = await toggleTask(id);
    if (res.avatar) {
      setDopamine({ text: `+${res.avatar.xp} XP for ${res.avatar.name}` });
      setTimeout(() => setDopamine(null), 2200);
    } else {
      setDopamine({ text: "+ XP" });
      setTimeout(() => setDopamine(null), 1800);
    }
    loadAll();
  }

  async function handleSubToggle(id, idx) {
    await toggleSubtask(id, idx);
    loadAll();
  }

  return (
    <div className="app-root">
      <div className="topbar">
        <div className="brand">flowOS</div>
        <button className="link" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="layout">
        <section className="left">
          <div className="panel">
            <h3>Avatars</h3>
            <div className="avatar-grid">
              {avatars.map((a) => (
                <div key={a._id} className="avatar-card">
                  <div className="av-name">{a.name}</div>
                  <div className="av-xp">{a.xp} XP</div>
                  <div className="av-level">Lvl {a.level}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h3>Quick Add</h3>
            <button onClick={() => openModal()}>+ New Task</button>
          </div>
        </section>

        <section className="right">
          <div className="panel">
            <h3>Tasks</h3>
            <div className="tasks-list">
              {tasks.map((t) => {
                const done = t.status === "completed";
                const total = t.subtasks?.length || 0;
                const doneCount = t.subtasks?.filter((s) => s.done).length || 0;
                const progress = total
                  ? Math.round((doneCount / total) * 100)
                  : done
                  ? 100
                  : 0;

                return (
                  <div
                    key={t._id}
                    className={`task-card ${done ? "done" : ""}`}
                  >
                    <div className="task-main">
                      <div className="task-title">{t.title}</div>
                      <div className="desc">{t.desc}</div>
                      <div className="sub-line">
                        <div className="bar">
                          <div style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="small">{progress}%</div>
                      </div>
                      <div className="subtasks">
                        {t.subtasks?.map((s, i) => (
                          <label key={i}>
                            <input
                              type="checkbox"
                              checked={s.done}
                              onChange={() => handleSubToggle(t._id, i)}
                            />
                            {s.title}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="task-actions">
                      <button onClick={() => handleToggle(t._id)}>
                        {done ? "Reopen" : "Complete"}
                      </button>
                      <button
                        className="danger"
                        onClick={async () => {
                          await deleteTask(t._id);
                          loadAll();
                        }}
                      >
                        Delete
                      </button>
                      {/*<button onClick={() => openModal(t)}>
                        + Add Subtask
                      </button>*/}
                      <button
                        onClick={() => {
                          setEditingTask(t);
                          startVoiceInput(true);
                        }}
                      >
                        🎤 Voice Input
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <TaskModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={saveTask}
        title={title}
        setTitle={setTitle}
        desc={desc}
        setDesc={setDesc}
        priority={priority}
        setPriority={setPriority}
        deadline={deadline}
        setDeadline={setDeadline}
        subtasks={subtasks}
        setSubtasks={setSubtasks}
        startVoiceInput={startVoiceInput}
      />

      {dopamine && <div className="dopamine">{dopamine.text} 🎉</div>}
    </div>
  );
}
