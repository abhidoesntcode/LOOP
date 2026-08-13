"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@acme.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow border p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project LOOP</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to access your dashboard</p>
        </div>

        {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="border-t pt-4 text-xs text-gray-600 space-y-1">
          <p className="font-semibold text-gray-800">Quick Test Credentials (Password: password123):</p>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => { setEmail("admin@acme.com"); setPassword("password123"); }}
              className="px-2 py-1 bg-gray-100 border rounded hover:bg-gray-200"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => { setEmail("analyst@acme.com"); setPassword("password123"); }}
              className="px-2 py-1 bg-gray-100 border rounded hover:bg-gray-200"
            >
              Analyst
            </button>
            <button
              type="button"
              onClick={() => { setEmail("viewer@acme.com"); setPassword("password123"); }}
              className="px-2 py-1 bg-gray-100 border rounded hover:bg-gray-200"
            >
              Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
