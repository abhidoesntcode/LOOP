"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AskLoop from "../../components/AskLoop";

interface FeedbackItem {
  id: string;
  content: string;
  channel: string;
  sentiment: string;
  sentimentScore: number;
  status: string;
  createdAt: string;
}

interface CustomUser {
  name?: string | null;
  email?: string | null;
  role?: string;
  workspaceId?: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [filterSentiment, setFilterSentiment] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Form State
  const [content, setContent] = useState("");
  const [channel, setChannel] = useState("Support Ticket");
  const [sentiment, setSentiment] = useState("POS");
  const [useAiSentiment, setUseAiSentiment] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const user = session?.user as CustomUser | undefined;
  const userRole = user?.role || "VIEWER";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchFeedback();
    }
  }, [status, router]);

  const fetchFeedback = async () => {
    try {
      const res = await fetch("/api/feedback");
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      }
    } catch (err) {
      console.error("Failed to load feedback", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const score = sentiment === "POS" ? 0.8 : sentiment === "NEG" ? -0.8 : 0.0;

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          channel,
          sentiment: useAiSentiment ? undefined : sentiment,
          sentimentScore: useAiSentiment ? undefined : score,
          autoAnalyze: useAiSentiment,
        }),
      });

      if (res.ok) {
        setContent("");
        setShowModal(false);
        fetchFeedback();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit feedback");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setFeedbacks((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: newStatus } : item
          )
        );
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback item?")) return;

    try {
      const res = await fetch(`/api/feedback/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchFeedback();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete feedback");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    if (filteredFeedbacks.length === 0) {
      alert("No feedback data available to export.");
      return;
    }

    const headers = ["ID", "Channel", "Status", "Sentiment", "Sentiment Score", "Content", "Created At"];

    const csvRows = [
      headers.join(","),
      ...filteredFeedbacks.map((item) =>
        [
          `"${item.id}"`,
          `"${item.channel}"`,
          `"${item.status || "NEW"}"`,
          `"${item.sentiment}"`,
          item.sentimentScore,
          `"${item.content.replace(/"/g, '""')}"`,
          `"${new Date(item.createdAt).toISOString()}"`,
        ].join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loop-feedback-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredFeedbacks = feedbacks.filter((item) => {
    const matchesSearch =
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      item.channel.toLowerCase().includes(search.toLowerCase());
    const matchesSentiment =
      filterSentiment === "ALL" || item.sentiment === filterSentiment;
    const matchesStatus =
      filterStatus === "ALL" || (item.status || "NEW") === filterStatus;
    return matchesSearch && matchesSentiment && matchesStatus;
  });

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-600">
        Loading workspace data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow border">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project LOOP</h1>
            <p className="text-sm text-gray-500">
              Logged in as{" "}
              <span className="font-semibold text-gray-800">
                {user?.name || user?.email}
              </span>
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition"
          >
            Sign Out
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-semibold">User Role</p>
            <p className="text-lg font-bold text-blue-600 mt-1">{userRole}</p>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-semibold">Workspace ID</p>
            <p className="text-xs font-mono text-gray-800 mt-2 truncate">
              {user?.workspaceId || "N/A"}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-semibold">Total Feedback Received</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{feedbacks.length}</p>
          </div>
        </div>

        {/* Ask LOOP AI Assistant Section */}
        <div className="bg-white rounded-lg border shadow p-6">
          <AskLoop />
        </div>

        {/* Main Feed Card */}
        <div className="bg-white rounded-lg border shadow p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Customer Feedback Stream</h2>
              <p className="text-xs text-gray-500">Live entries from Neon database</p>
            </div>
            {userRole !== "VIEWER" && (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition"
              >
                + Add Feedback
              </button>
            )}
          </div>

          {/* Search, Filters, and Export */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="text"
              placeholder="Search feedback or channel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <select
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              className="border rounded px-3 py-1.5 text-sm text-black"
            >
              <option value="ALL">All Sentiments</option>
              <option value="POS">Positive</option>
              <option value="NEU">Neutral</option>
              <option value="NEG">Negative</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded px-3 py-1.5 text-sm text-black"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded border transition flex items-center justify-center gap-1"
            >
              <span>📥</span> Export CSV
            </button>
          </div>

          {/* Feedback List */}
          {filteredFeedbacks.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">
              No matching feedback entries found.
            </p>
          ) : (
            <div className="divide-y">
              {filteredFeedbacks.map((item) => (
                <div key={item.id} className="py-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700 border">
                        {item.channel}
                      </span>
                      {userRole !== "VIEWER" ? (
                        <select
                          value={item.status || "NEW"}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className="text-xs border rounded px-2 py-0.5 font-medium text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="NEW">NEW</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                        </select>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded border bg-gray-50 text-gray-600">
                          {item.status || "NEW"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                          item.sentiment === "POS"
                            ? "bg-green-100 text-green-800"
                            : item.sentiment === "NEG"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.sentiment}
                      </span>
                      {userRole === "ADMIN" && (
                        <button
                          onClick={() => handleDeleteFeedback(item.id)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-800">{item.content}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Feedback Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Add Customer Feedback</h3>

            <form onSubmit={handleCreateFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm text-black"
                >
                  <option value="Support Ticket">Support Ticket</option>
                  <option value="App Store">App Store</option>
                  <option value="NPS Survey">NPS Survey</option>
                  <option value="Sales Call">Sales Call</option>
                  <option value="Community">Community</option>
                </select>
              </div>

              {/* AI Auto-Label Toggle */}
              <div className="flex items-center justify-between border p-3 rounded bg-blue-50/50">
                <span className="text-sm font-medium text-gray-800">
                  Auto-detect Sentiment via AI
                </span>
                <input
                  type="checkbox"
                  checked={useAiSentiment}
                  onChange={(e) => setUseAiSentiment(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* Manual Sentiment Selection */}
              {!useAiSentiment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Manual Sentiment
                  </label>
                  <select
                    value={sentiment}
                    onChange={(e) => setSentiment(e.target.value)}
                    className="mt-1 w-full border rounded px-3 py-2 text-sm text-black"
                  >
                    <option value="POS">Positive</option>
                    <option value="NEU">Neutral</option>
                    <option value="NEG">Negative</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Feedback Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={4}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm text-black"
                  placeholder="Enter detailed feedback..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
