/**
 * LLMPanel — text input for natural language building queries.
 * Sends query to /api/llm/query, applies returned filter to the 3D view.
 */

import { useState } from "react";
import { useStore } from "../store/useStore";

const EXAMPLES = [
  "Highlight buildings over 100 metres",
  "Show commercial buildings",
  "Buildings in RC-G zoning",
  "Show buildings built before 1980",
  "Residential buildings worth less than $500,000",
  "Office towers with more than 20 floors",
];

export default function LLMPanel() {
  const { runLLMQuery, clearFilter, llmLoading, llmError, filterDescription, activeFilter } =
    useStore();
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    runLLMQuery(q);
  };

  const handleExample = (ex) => {
    setInput(ex);
    runLLMQuery(ex);
  };

  return (
    <div className="glass p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
          AI Query
        </span>
        {activeFilter && (
          <button
            onClick={clearFilter}
            className="ml-auto text-xs text-slate-400 hover:text-white border border-slate-600 px-2 py-0.5 rounded"
          >
            Clear
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='e.g. "show buildings over 50m"'
          className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm
                     text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          disabled={llmLoading}
        />
        <button
          type="submit"
          disabled={llmLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed
                     px-3 py-2 rounded-lg text-sm font-medium transition"
        >
          {llmLoading ? "…" : "→"}
        </button>
      </form>

      {/* Active filter badge */}
      {filterDescription && !llmLoading && (
        <div className="text-xs text-emerald-400 bg-emerald-900/30 border border-emerald-800 rounded px-2 py-1.5">
          ✓ {filterDescription}
        </div>
      )}

      {llmError && (
        <div className="text-xs text-red-400 bg-red-900/30 border border-red-800 rounded px-2 py-1">
          {llmError}
        </div>
      )}

      {/* Example queries */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-500">Examples:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => handleExample(ex)}
            className="text-left text-xs text-slate-400 hover:text-blue-300 transition truncate"
          >
            › {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
