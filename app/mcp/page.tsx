"use client";

import { useEffect, useState } from "react";

interface McpServer {
  // server ที่เพิ่มด้วย claude mcp add รุ่นเก่าอาจไม่มี type (ถือเป็น stdio)
  type?: "stdio" | "sse" | "http";
  command?: string;
  args?: string[];
  url?: string;
}

export default function McpPage() {
  const [servers, setServers] = useState<Record<string, McpServer>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<McpServer & { name: string; argsText?: string }>({
    name: "",
    type: "stdio",
    command: "",
    argsText: "",
    url: "",
  });
  const [error, setError] = useState("");

  const [loadError, setLoadError] = useState("");

  function load() {
    setLoading(true);
    fetch("/api/mcp")
      .then((r) => r.json())
      .then((d) => {
        setLoadError(d.error ?? "");
        setServers(d.mcpServers ?? {});
        setLoading(false);
      });
  }

  useEffect(load, []);

  function startNew() {
    setForm({ name: "", type: "stdio", command: "", argsText: "", url: "" });
    setEditing("__new__");
    setError("");
  }

  function startEdit(name: string, server: McpServer) {
    setForm({
      name,
      type: server.type ?? "stdio",
      command: server.command ?? "",
      argsText: (server.args ?? []).join(" "),
      url: server.url ?? "",
    });
    setEditing(name);
    setError("");
  }

  async function handleSave() {
    setError("");
    if (!form.name) {
      setError("ต้องระบุชื่อ server");
      return;
    }
    const server: McpServer =
      form.type === "stdio"
        ? { type: "stdio", command: form.command, args: (form.argsText ?? "").split(" ").filter(Boolean) }
        : { type: form.type, url: form.url };

    const res = await fetch("/api/mcp", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, server }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "บันทึกไม่สำเร็จ");
      return;
    }
    setEditing(null);
    load();
  }

  async function handleDelete(name: string) {
    if (!confirm(`ลบ MCP server "${name}"?`)) return;
    await fetch("/api/mcp", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    load();
  }

  return (
    <div className="p-8 max-w-3xl">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] text-paper/40">~/.claude.json#mcpServers</p>
          <h1 className="text-xl font-mono">mcp servers</h1>
        </div>
        <button
          onClick={startNew}
          className="font-mono text-[12px] uppercase tracking-wider bg-ember/90 hover:bg-ember text-ink px-4 py-2 rounded"
        >
          + new server
        </button>
      </header>

      {editing && (
        <div className="border border-line rounded p-4 mb-6 flex flex-col gap-3">
          <input
            value={form.name}
            disabled={editing !== "__new__"}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="ชื่อ server เช่น github"
            className="bg-ink border border-line rounded px-3 py-2 font-mono text-sm outline-none focus:border-ember disabled:opacity-50"
          />
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as McpServer["type"] }))}
            className="bg-ink border border-line rounded px-3 py-2 font-mono text-sm outline-none focus:border-ember"
          >
            <option value="stdio">stdio</option>
            <option value="sse">sse</option>
            <option value="http">http</option>
          </select>
          {form.type === "stdio" ? (
            <>
              <input
                value={form.command}
                onChange={(e) => setForm((f) => ({ ...f, command: e.target.value }))}
                placeholder="command เช่น npx"
                className="bg-ink border border-line rounded px-3 py-2 font-mono text-sm outline-none focus:border-ember"
              />
              <input
                value={form.argsText}
                onChange={(e) => setForm((f) => ({ ...f, argsText: e.target.value }))}
                placeholder="args คั่นด้วยเว้นวรรค เช่น -y @modelcontextprotocol/server-github"
                className="bg-ink border border-line rounded px-3 py-2 font-mono text-sm outline-none focus:border-ember"
              />
            </>
          ) : (
            <input
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://..."
              className="bg-ink border border-line rounded px-3 py-2 font-mono text-sm outline-none focus:border-ember"
            />
          )}
          {error && <p className="font-mono text-[12px] text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="font-mono text-[12px] uppercase tracking-wider bg-ember/90 hover:bg-ember text-ink px-4 py-2 rounded"
            >
              บันทึก
            </button>
            <button onClick={() => setEditing(null)} className="font-mono text-[12px] uppercase tracking-wider text-paper/50 px-4 py-2">
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {loadError && (
        <p className="font-mono text-[12px] text-red-400 mb-4 border border-red-400/30 bg-red-400/5 p-3 rounded">{loadError}</p>
      )}

      {loading ? (
        <p className="font-mono text-sm text-paper/40">กำลังโหลด...</p>
      ) : Object.keys(servers).length === 0 ? (
        <p className="font-mono text-sm text-paper/40">ยังไม่มี MCP server</p>
      ) : (
        <div className="flex flex-col gap-2">
          {Object.entries(servers).map(([name, server]) => (
            <div key={name} className="border border-line rounded p-4 flex items-center justify-between">
              <div>
                <p className="font-mono text-sm text-paper">{name}</p>
                <p className="font-mono text-[11px] text-paper/40">
                  {server.type ?? "stdio"} · {server.command ?? server.url}
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => startEdit(name, server)} className="font-mono text-[12px] text-paper/50 hover:text-paper">
                  แก้ไข
                </button>
                <button onClick={() => handleDelete(name)} className="font-mono text-[12px] text-red-400 hover:text-red-300">
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
