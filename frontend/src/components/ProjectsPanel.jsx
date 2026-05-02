/**
 * ProjectsPanel — username login, save current filter as project, load saved projects.
 */

import { useState } from "react";
import { useStore } from "../store/useStore";

export default function ProjectsPanel() {
  const {
    user, login, projects, saveProject, loadProject, deleteProject,
    activeFilter, filterDescription,
  } = useStore();

  const [usernameInput, setUsernameInput] = useState("");
  const [projectName, setProjectName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const u = usernameInput.trim();
    if (!u) return;
    await login(u);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const n = projectName.trim();
    if (!n) return;
    setSaving(true);
    await saveProject(n);
    setSaving(false);
    setProjectName("");
  };

  if (!user) {
    return (
      <div className="glass p-4 flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
          Sign In
        </span>
        <form onSubmit={handleLogin} className="flex gap-2">
          <input
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="Username"
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm
                       text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
          />
          <button
            type="submit"
            disabled={!usernameInput.trim()}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 px-3 py-2 rounded-lg text-sm font-medium transition"
          >
            Go
          </button>
        </form>
        <p className="text-xs text-slate-500">
          Enter any username to save &amp; load analyses.
        </p>
      </div>
    );
  }

  return (
    <div className="glass p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
          Projects
        </span>
        <span className="text-xs text-slate-400">{user.username}</span>
      </div>

      {/* Save current filter */}
      {activeFilter && (
        <form onSubmit={handleSave} className="flex gap-2">
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project name…"
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm
                       text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
          />
          <button
            type="submit"
            disabled={saving || !projectName.trim()}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap"
          >
            {saving ? "…" : "Save"}
          </button>
        </form>
      )}

      {/* Project list */}
      <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
        {projects.length === 0 && (
          <p className="text-xs text-slate-500">No saved projects yet.</p>
        )}
        {projects.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-2 group"
          >
            <button
              onClick={() => loadProject(p)}
              className="flex-1 text-left text-xs text-slate-300 hover:text-white
                         bg-slate-800 hover:bg-slate-700 rounded px-2 py-1.5 transition truncate"
              title={p.query_text}
            >
              <span className="font-medium">{p.name}</span>
              <span className="text-slate-500 ml-1">— {p.query_text?.slice(0, 30)}</span>
            </button>
            <button
              onClick={() => deleteProject(p.id)}
              className="text-slate-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition"
              title="Delete"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
