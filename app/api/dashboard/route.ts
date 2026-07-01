import { NextResponse } from "next/server";
import fs from "fs/promises";
import { CLAUDE_JSON, claudePath, pathExists, readFileSafe } from "@/lib/claudeHome";
import { SettingsSchema } from "@/lib/schemas";

export async function GET() {
  const claudeMdPath = claudePath("CLAUDE.md");
  const skillsDir = claudePath("skills");
  const agentsDir = claudePath("agents");
  const settingsPath = claudePath("settings.json");

  const claudeMdExists = await pathExists(claudeMdPath);
  let claudeMdModified: string | null = null;
  if (claudeMdExists) {
    const stat = await fs.stat(claudeMdPath);
    claudeMdModified = stat.mtime.toISOString();
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
  const rawSettings = await readFileSafe(settingsPath);
  if (rawSettings) {
    try {
      settingsValid = SettingsSchema.safeParse(JSON.parse(rawSettings)).success;
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

  return NextResponse.json({
    claudeHome: claudePath(),
    claudeMdExists,
    claudeMdModified,
    skillCount,
    agentCount,
    mcpServerCount,
    settingsValid,
  });
}
