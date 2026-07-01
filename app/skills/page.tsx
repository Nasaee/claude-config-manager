"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Skill {
  slug: string;
  name: string;
  description: string;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    fetch("/api/skills")
      .then((r) => r.json())
      .then((d) => {
        setSkills(d.skills ?? []);
        setLoading(false);
      });
  }

  useEffect(load, []);

  async function handleCreate() {
    setError("");
    const res = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: newSlug, description: newDesc }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "สร้างไม่สำเร็จ");
      return;
    }
    setCreating(false);
    setNewSlug("");
    setNewDesc("");
    load();
  }

  return (
    <div className="p-8 max-w-3xl">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] text-paper/40">~/.claude/skills/</p>
          <h1 className="text-xl font-mono">skills</h1>
        </div>
        <button
          onClick={() => setCreating((v) => !v)}
          className="font-mono text-[12px] uppercase tracking-wider bg-ember/90 hover:bg-ember text-ink px-4 py-2 rounded"
        >
          + new skill
        </button>
      </header>

      {creating && (
        <div className="border border-line rounded p-4 mb-6 flex flex-col gap-3">
          <input
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            placeholder="ชื่อ skill เช่น pdf-report"
            className="bg-ink border border-line rounded px-3 py-2 font-mono text-sm outline-none focus:border-ember"
          />
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="คำอธิบายสั้นๆ"
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
      ) : skills.length === 0 ? (
        <p className="font-mono text-sm text-paper/40">ยังไม่มี skill — กด "+ new skill" เพื่อสร้างอันแรก</p>
      ) : (
        <div className="flex flex-col gap-2">
          {skills.map((s) => (
            <Link
              key={s.slug}
              href={`/skills/${s.slug}`}
              className="border border-line rounded p-4 hover:border-ember transition-colors block"
            >
              <p className="font-mono text-[11px] text-paper/40">~/.claude/skills/{s.slug}/SKILL.md</p>
              <p className="font-mono text-sm text-paper">{s.name}</p>
              <p className="text-sm text-paper/60 mt-1">{s.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
