import React, { useState, useEffect } from "react";
import { aiSummarize } from "../api";

export default function TaskModal({ show, onClose, onSave, task }) {
  const [title, setTitle] = useState(task?.title || "");
  const [desc, setDesc] = useState(task?.desc || "");
  const [priority, setPriority] = useState(task?.priority || "Medium");
  const [deadline, setDeadline] = useState(task?.deadline || "");
  const [subtasks, setSubtasks] = useState(task?.subtasks || []);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDesc(task.desc);
      setPriority(task.priority || "Medium");
      setDeadline(task.deadline || "");
      setSubtasks(task.subtasks || []);
    }
  }, [task]);

  if (!show) return null;

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, { title: "", done: false }]);
  };

  const handleSubtaskChange = (index, value) => {
    const newSubs = [...subtasks];
    newSubs[index].title = value;
    setSubtasks(newSubs);
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice input not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setTitle(transcript);
    };
    recognition.start();
  };

  const handleAskAI = async () => {
    if (!title.trim()) return;
    try {
      const data = await aiSummarize(title);
      setDesc(title);
      setTitle(data.title || title);
      setDeadline(data.deadline || deadline);
      setPriority(data.priority || priority);
      if (data.subtasks)
        setSubtasks(data.subtasks.map((t) => ({ title: t, done: false })));
    } catch (err) {
      console.error("AI extraction failed:", err);
      alert("AI extraction failed.");
    }
  };

  const handleSave = () => {
    onSave({ title, desc, priority, deadline, subtasks });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{task ? "Edit Task" : "New Task"}</h3>
        <input
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <input
          placeholder="Deadline"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <div className="subtasks">
          {subtasks.map((s, i) => (
            <input
              key={i}
              placeholder={`Subtask ${i + 1}`}
              value={s.title}
              onChange={(e) => handleSubtaskChange(i, e.target.value)}
            />
          ))}
          <button onClick={handleAddSubtask}>+ Add Subtask</button>
        </div>

        <div style={{ marginTop: 10 }}>
          <button onClick={handleVoiceInput}>🎤 Voice Input</button>
          <button onClick={handleAskAI}>Ask AI</button>
        </div>

        <div style={{ marginTop: 10 }}>
          <button onClick={handleSave}>Save</button>
          <button className="secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
