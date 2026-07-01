"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SaveBar from "@/components/SaveBar";

const AVAILABLE_TOOLS = ["Read", "Write", "Edit", "Bash", "Grep", "Glob", "WebFetch", "WebSearch"];
const MODELS = ["inherit", "sonnet", "opus", "haiku"];

export default function AgentDetailPage() {
  const { name } = useParams<{ name: string }>();
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [tools, setTools] = useState<string[]>([]);
  const [model, setModel] = useState("inherit");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/agents/${name}`)
      .then((r) => r.json())
      .then((d) => {
        setDescription(d.frontmatter?.description ?? "");
        // ไฟล์จริงเก็บ tools เป็น comma-separated string แต่ของเก่าอาจเป็น array
        const rawTools = d.frontmatter?.tools;
        setTools(
          typeof rawTools === "string"
            ? rawTools.split(",").map((t: string) => t.trim()).filter(Boolean)
            : rawTools ?? []
        );
        setModel(d.frontmatter?.model ?? "inherit");
        setBody(d.body?.trim() ?? "");
        setLoading(false);
      });
  }, [name]);

  function toggleTool(tool: string) {
    setTools((prev) => (prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]));
    setStatus("idle");
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/agents/${name}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frontmatter: { name, description, tools, model }, body }),
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
    if (!confirm(`ลบ agent "${name}"?`)) return;
    await fetch(`/api/agents/${name}`, { method: "DELETE" });
    router.push("/agents");
  }

  if (loading) return <div className="p-8 font-mono text-sm text-paper/40">กำลังโหลด...</div>;

  return (
    <div className="flex flex-col h-screen">
      <header className="px-8 py-5 border-b border-line flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] text-paper/40">~/.claude/agents/{name}.md</p>
          <h1 className="text-xl font-mono">{name}</h1>
        </div>
        <button onClick={handleDelete} className="font-mono text-[12px] text-red-400 hover:text-red-300">
          ลบ agent นี้
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 max-w-3xl">
        <div>
          <label className="font-mono text-[11px] uppercase tracking-wider text-paper/50">description</label>
          <input
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setStatus("idle");
            }}
            className="mt-2 w-full bg-surface border border-line rounded px-3 py-2 font-mono text-sm outline-none focus:border-ember"
          />
        </div>

        <div>
          <label className="font-mono text-[11px] uppercase tracking-wider text-paper/50">model</label>
          <select
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
              setStatus("idle");
            }}
            className="mt-2 bg-surface border border-line rounded px-3 py-2 font-mono text-sm outline-none focus:border-ember"
          >
            {MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-mono text-[11px] uppercase tracking-wider text-paper/50">tools</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {AVAILABLE_TOOLS.map((tool) => (
              <button
                key={tool}
                onClick={() => toggleTool(tool)}
                className={`font-mono text-[12px] px-3 py-1.5 rounded border ${
                  tools.includes(tool) ? "border-ember text-ember bg-ember/10" : "border-line text-paper/50 hover:border-paper/30"
                }`}
              >
                {tool}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <label className="font-mono text-[11px] uppercase tracking-wider text-paper/50 mb-2">system prompt</label>
          <textarea
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setStatus("idle");
            }}
            spellCheck={false}
            className="flex-1 min-h-[300px] bg-surface border border-line rounded p-4 font-mono text-sm outline-none resize-none focus:border-ember leading-relaxed"
          />
        </div>
      </div>

      <SaveBar status={status} message={message} onSave={handleSave} saving={saving} />
    </div>
  );
}
