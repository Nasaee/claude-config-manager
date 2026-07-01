"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Agent {
  slug: string;
  name: string;
  description: string;
  valid: boolean;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d) => {
        setAgents(d.agents ?? []);
        setLoading(false);
      });
  }

  useEffect(load, []);

  async function handleCreate() {
    setError("");
    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: newSlug }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "สร้างไม่สำเร็จ");
      return;
    }
    setCreating(false);
    setNewSlug("");
    load();
  }

  return (
    <div className="p-8 max-w-3xl">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] text-paper/40">~/.claude/agents/</p>
          <h1 className="text-xl font-mono">agents</h1>
        </div>
        <button
          onClick={() => setCreating((v) => !v)}
          className="font-mono text-[12px] uppercase tracking-wider bg-ember/90 hover:bg-ember text-ink px-4 py-2 rounded"
        >
          + new agent
        </button>
      </header>

      {creating && (
        <div className="border border-line rounded p-4 mb-6 flex flex-col gap-3">
          <input
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            placeholder="ชื่อ agent เช่น code-reviewer"
            className="bg-ink border border-line rounded px-3 py-2 font-mono text-sm outline-none focus:border-ember"
          />
          {error && <p className="font-mono text-[12px] text-red-400">{error}</p>}
          <button
            onClick={handleCreate}
            className="self-start font-mono text-[12px] uppercase tracking-wider bg-ember/90 hover:bg-ember text-ink px-4 py-2 rounded"
          >
            สร้าง
          </button>
        </div>
      )}

      {loading ? (
        <p className="font-mono text-sm text-paper/40">กำลังโหลด...</p>
      ) : agents.length === 0 ? (
        <p className="font-mono text-sm text-paper/40">ยังไม่มี agent — กด "+ new agent" เพื่อสร้างอันแรก</p>
      ) : (
        <div className="flex flex-col gap-2">
          {agents.map((a) => (
            <Link
              key={a.slug}
              href={`/agents/${a.slug}`}
              className="border border-line rounded p-4 hover:border-ember transition-colors block"
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] text-paper/40">~/.claude/agents/{a.slug}.md</p>
                {!a.valid && <span className="font-mono text-[10px] text-red-400">frontmatter ผิดพลาด</span>}
              </div>
              <p className="font-mono text-sm text-paper">{a.name}</p>
              <p className="text-sm text-paper/60 mt-1">{a.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
