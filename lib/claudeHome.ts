import fs from "fs/promises";
import path from "path";
import os from "os";

export const CLAUDE_HOME =
  process.env.CLAUDE_HOME || path.join(os.homedir(), ".claude");

// user-scope MCP servers อยู่ใน ~/.claude.json (คนละไฟล์กับ ~/.claude/settings.json)
// ถ้า override CLAUDE_HOME ไว้ทดสอบ จะได้ไฟล์ sibling เช่น /path/test-home.json
export const CLAUDE_JSON = process.env.CLAUDE_JSON || `${CLAUDE_HOME}.json`;

export function claudePath(...segments: string[]) {
  return path.join(CLAUDE_HOME, ...segments);
}

// กัน path traversal จาก route param — อนุญาตเฉพาะชื่อไฟล์ล้วนๆ ไม่มี separator
// และห้ามเป็น "." / ".." (จุดกลางชื่ออย่าง my.agent ยังใช้ได้)
export function isSafeSlug(name: string) {
  return /^(?!\.+$)[A-Za-z0-9._-]+$/.test(name);
}

export async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function pathExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function readFileSafe(p: string): Promise<string | null> {
  try {
    return await fs.readFile(p, "utf-8");
  } catch {
    return null;
  }
}
