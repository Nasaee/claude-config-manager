import { NextResponse } from "next/server";
import { CLAUDE_JSON, isSafeSlug, readFileSafe } from "@/lib/claudeHome";
import { writeFileAtomic } from "@/lib/backup";
import { McpServerSchema } from "@/lib/schemas";

// user-scope MCP servers อยู่ที่ ~/.claude.json (top-level key `mcpServers`)
// ไฟล์นี้ Claude Code ใช้เก็บ state อย่างอื่นด้วย ห้ามเขียนทับถ้า parse ไม่ผ่าน
async function loadClaudeJson(): Promise<Record<string, any> | null> {
  const raw = await readFileSafe(CLAUDE_JSON);
  if (raw === null) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const PARSE_ERROR = `${CLAUDE_JSON} ไม่ใช่ JSON ที่ถูกต้อง — ไม่กล้าเขียนทับ กรุณาแก้ไฟล์ก่อน`;

export async function GET() {
  const config = await loadClaudeJson();
  if (config === null) {
    return NextResponse.json({ error: PARSE_ERROR }, { status: 500 });
  }
  return NextResponse.json({ mcpServers: config.mcpServers ?? {} });
}

export async function PUT(req: Request) {
  const { name, server } = await req.json();
  if (!name || !isSafeSlug(name)) {
    return NextResponse.json(
      { error: "ชื่อ server ต้องเป็นตัวอักษร ตัวเลข . _ - เท่านั้น" },
      { status: 400 }
    );
  }
  const result = McpServerSchema.safeParse(server);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message ?? "รูปแบบ server ไม่ถูกต้อง" },
      { status: 400 }
    );
  }
  const config = await loadClaudeJson();
  if (config === null) {
    return NextResponse.json({ error: PARSE_ERROR }, { status: 500 });
  }
  config.mcpServers = config.mcpServers ?? {};
  config.mcpServers[name] = server;
  await writeFileAtomic(CLAUDE_JSON, JSON.stringify(config, null, 2));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { name } = await req.json();
  const config = await loadClaudeJson();
  if (config === null) {
    return NextResponse.json({ error: PARSE_ERROR }, { status: 500 });
  }
  if (config.mcpServers) {
    delete config.mcpServers[name];
  }
  await writeFileAtomic(CLAUDE_JSON, JSON.stringify(config, null, 2));
  return NextResponse.json({ ok: true });
}
