"use client";

import { useEffect, useState } from "react";
import SaveBar from "@/components/SaveBar";

export default function SettingsPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setContent(d.content);
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus("success");
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 font-mono text-sm text-paper/40">กำลังโหลด...</div>;

  return (
    <div className="flex flex-col h-screen">
      <header className="px-8 py-5 border-b border-line">
        <p className="font-mono text-[11px] text-paper/40">~/.claude/settings.json</p>
        <h1 className="text-xl font-mono">settings</h1>
        <p className="font-mono text-[11px] text-paper/40 mt-1">
          permissions, env, hooks อยู่ในไฟล์นี้ — แก้ผ่าน raw JSON ได้โดยตรง (ส่วน MCP servers อยู่ใน ~/.claude.json จัดการผ่านหน้า{" "}
          <a href="/mcp" className="underline text-ember">
            mcp servers
          </a>
          )
        </p>
      </header>
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setStatus("idle");
        }}
        spellCheck={false}
        className="flex-1 bg-ink text-paper font-mono text-sm p-8 outline-none resize-none leading-relaxed"
      />
      <SaveBar status={status} message={message} onSave={handleSave} saving={saving} />
    </div>
  );
}
