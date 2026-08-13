"use client";

import { useState } from "react";

export default function AskLoop() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("/api/ask-loop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      if (res.ok) {
        setAnswer(data.answer);
      } else {
        setAnswer(data.error || "Failed to generate AI response.");
      }
    } catch (err) {
      console.error(err);
      setAnswer("Error connecting to AI assistant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-bold text-gray-900 flex items-center gap-2">
          <span>✨</span> Ask LOOP AI
        </h3>
        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium">
          Powered by Gemini
        </span>
      </div>

      <form onSubmit={handleAsk} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. What are the main complaints across support tickets?"
          className="flex-1 border rounded px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Ask AI"}
        </button>
      </form>

      {answer && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-800 leading-relaxed whitespace-pre-line">
          {answer}
        </div>
      )}
    </div>
  );
}
