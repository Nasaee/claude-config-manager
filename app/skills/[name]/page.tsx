"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SaveBar from "@/components/SaveBar";

export default function SkillDetailPage() {
  const { name } = useParams<{ name: string }>();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/skills/${name}`)
      .then((r) => r.json())
      .then((d) => {
        setContent(d.content ?? "");
        setLoading(false);
      });
  }, [name]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/skills/${name}`, {
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

  async function handleDelete() {
    if (!confirm(`ลบ skill "${name}" ทั้งโฟลเดอร์?`)) return;
    await fetch(`/api/skills/${name}`, { method: "DELETE" });
    router.push("/skills");
  }

  if (loading) return <div className="p-8 font-mono text-sm text-paper/40">กำลังโหลด...</div>;

  return (
    <div className="flex flex-col h-screen">
      <header className="px-8 py-5 border-b border-line flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] text-paper/40">~/.claude/skills/{name}/SKILL.md</p>
          <h1 className="text-xl font-mono">{name}</h1>
        </div>
        <button onClick={handleDelete} className="font-mono text-[12px] text-red-400 hover:text-red-300">
          ลบ skill นี้
        </button>
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
