import React, { useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

function App() {
  const [tasks, setTasks] = useState([
    { title: "", estimatedHours: "", dueDate: "", dependencies: "" },
  ]);
  const [workHoursPerDay, setWorkHoursPerDay] = useState(8);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Update task values
  const handleChange = (index, field, value) => {
    const updated = [...tasks];
    updated[index][field] = value;
    setTasks(updated);
  };

  // Add new task
  const addTask = () =>
    setTasks([...tasks, { title: "", estimatedHours: "", dueDate: "", dependencies: "" }]);

  // Submit to backend
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Format tasks
      const formattedTasks = tasks.map((t) => ({
        title: t.title,
        estimatedHours: Number(t.estimatedHours),
        dueDate: t.dueDate,
        dependencies: t.dependencies
          ? t.dependencies.split(",").map((d) => d.trim()).filter((d) => d)
          : [],
      }));

      // Post request
      const res = await axios.post(
        "https://smart-scheduler-backend-upgr.onrender.com/api/v1/projects/1/schedule",
        { tasks: formattedTasks, workHoursPerDay }
      );
      
      

      setResult(res.data);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20, fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center" }}>Smart Scheduler</h2>

      {/* Work hours per day */}
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <label>
          Work hours per day:{" "}
          <input
            type="number"
            value={workHoursPerDay}
            min={1}
            onChange={(e) => setWorkHoursPerDay(Number(e.target.value))}
          />
        </label>
      </div>

      {/* Task inputs */}
      {tasks.map((t, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "10px",
            marginBottom: "10px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "10px",
          }}
        >
          <input
            type="text"
            placeholder="Task title"
            value={t.title}
            onChange={(e) => handleChange(i, "title", e.target.value)}
          />
          <input
            type="number"
            placeholder="Hours"
            value={t.estimatedHours}
            onChange={(e) => handleChange(i, "estimatedHours", e.target.value)}
          />
          <input
            type="date"
            value={t.dueDate}
            onChange={(e) => handleChange(i, "dueDate", e.target.value)}
          />
          <input
            type="text"
            placeholder="Dependencies (comma-separated)"
            value={t.dependencies}
            onChange={(e) => handleChange(i, "dependencies", e.target.value)}
          />
        </div>
      ))}

      {/* Buttons */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button onClick={addTask}>➕ Add Task</button>{" "}
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Scheduling..." : "🗓️ Generate Schedule"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div style={{ marginTop: 30 }}>
          <h3>✅ Recommended Order</h3>
          <ol>
            {result.recommendedOrder.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>

          <h3>📅 Schedule</h3>
          {result.schedule.map((day, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "10px",
                margin: "10px 0",
                backgroundColor: "#f9f9f9",
              }}
            >
              <strong>{dayjs(day.date).format("DD MMM YYYY")}</strong>
              <ul>
                {day.allocations.map((a, j) => (
                  <li key={j}>
                    {a.title}: {a.hours} hours
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {result.warnings?.length > 0 && (
            <div style={{ color: "red", marginTop: "20px" }}>
              ⚠️ Warnings:
              <ul>
                {result.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
