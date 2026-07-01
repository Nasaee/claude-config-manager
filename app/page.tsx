import fs from "fs/promises";
import Link from "next/link";
import { CLAUDE_JSON, claudePath, pathExists, readFileSafe } from "@/lib/claudeHome";
import { SettingsSchema } from "@/lib/schemas";
import StatCard from "@/components/StatCard";

export const dynamic = "force-dynamic";

async function getSummary() {
  const claudeMdPath = claudePath("CLAUDE.md");
  const skillsDir = claudePath("skills");
  const agentsDir = claudePath("agents");
  const settingsPath = claudePath("settings.json");

  const claudeMdExists = await pathExists(claudeMdPath);
  let claudeMdModified: string | null = null;
  if (claudeMdExists) {
    const stat = await fs.stat(claudeMdPath);
    claudeMdModified = stat.mtime.toLocaleString("th-TH");
  }

  let skillCount = 0;
  if (await pathExists(skillsDir)) {
    const entries = await fs.readdir(skillsDir, { withFileTypes: true });
    skillCount = entries.filter((e) => e.isDirectory()).length;
  }

  let agentCount = 0;
  if (await pathExists(agentsDir)) {
    const entries = await fs.readdir(agentsDir, { withFileTypes: true });
    agentCount = entries.filter((e) => e.isFile() && e.name.endsWith(".md")).length;
  }

  let settingsValid = true;
  const raw = await readFileSafe(settingsPath);
  if (raw) {
    try {
      settingsValid = SettingsSchema.safeParse(JSON.parse(raw)).success;
    } catch {
      settingsValid = false;
    }
  }

  // MCP servers ระดับ user อยู่ใน ~/.claude.json ไม่ใช่ settings.json
  let mcpServerCount = 0;
  const rawClaudeJson = await readFileSafe(CLAUDE_JSON);
  if (rawClaudeJson) {
    try {
      mcpServerCount = Object.keys(JSON.parse(rawClaudeJson).mcpServers ?? {}).length;
    } catch {
      // นับไม่ได้ก็แสดง 0 ไป หน้า mcp จะฟ้อง error เอง
    }
  }

  return {
    claudeHome: claudePath(),
    claudeMdExists,
    claudeMdModified,
    skillCount,
    agentCount,
    mcpServerCount,
    settingsValid,
  };
}

export default async function DashboardPage() {
  const s = await getSummary();

  return (
    <div className="p-8 max-w-4xl">
      <header className="mb-8">
        <p className="font-mono text-[11px] text-paper/40 mb-1">{s.claudeHome}</p>
        <h1 className="text-xl font-mono text-paper">dashboard</h1>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="CLAUDE.md"
          value={s.claudeMdExists ? "พบไฟล์" : "ไม่พบ"}
          path="~/.claude/CLAUDE.md"
          tone={s.claudeMdExists ? "good" : "bad"}
        />
        <StatCard label="skills" value={s.skillCount} path="~/.claude/skills/" />
        <StatCard label="agents" value={s.agentCount} path="~/.claude/agents/" />
        <StatCard
          label="mcp servers"
          value={s.mcpServerCount}
          path="~/.claude.json"
          tone={s.settingsValid ? "default" : "bad"}
        />
      </div>

      {s.claudeMdModified && (
        <p className="font-mono text-[12px] text-paper/40 mb-8">
          CLAUDE.md แก้ไขล่าสุด: {s.claudeMdModified}
        </p>
      )}

      {!s.settingsValid && (
        <p className="font-mono text-[12px] text-red-400 mb-8 border border-red-400/30 bg-red-400/5 p-3 rounded">
          settings.json มีปัญหา รูปแบบไม่ถูกต้อง — ตรวจสอบที่หน้า{" "}
          <Link href="/settings" className="underline">
            settings
          </Link>
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link href="/claude-md" className="border border-line rounded p-4 hover:border-ember transition-colors font-mono text-sm">
          → แก้ไข CLAUDE.md
        </Link>
        <Link href="/skills" className="border border-line rounded p-4 hover:border-ember transition-colors font-mono text-sm">
          → จัดการ skills
        </Link>
        <Link href="/agents" className="border border-line rounded p-4 hover:border-ember transition-colors font-mono text-sm">
          → จัดการ agents
        </Link>
        <Link href="/mcp" className="border border-line rounded p-4 hover:border-ember transition-colors font-mono text-sm">
          → จัดการ MCP servers
        </Link>
      </div>
    </div>
  );
}
