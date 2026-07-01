import { NextResponse } from "next/server";
import fs from "fs/promises";
import matter from "gray-matter";
import { claudePath, isSafeSlug, pathExists, readFileSafe } from "@/lib/claudeHome";
import { writeFileAtomic } from "@/lib/backup";
import { AgentFrontmatterSchema, toolsToString } from "@/lib/schemas";

function agentFile(name: string) {
  return claudePath("agents", `${name}.md`);
}

function badName() {
  return NextResponse.json({ error: "ชื่อ agent ไม่ถูกต้อง" }, { status: 400 });
}

type Params = { params: Promise<{ name: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { name } = await params;
  if (!isSafeSlug(name)) return badName();
  const raw = await readFileSafe(agentFile(name));
  if (raw === null) {
    return NextResponse.json({ error: "ไม่พบ agent นี้" }, { status: 404 });
  }
  const { data, content } = matter(raw);
  return NextResponse.json({ frontmatter: data, body: content });
}

export async function PUT(req: Request, { params }: Params) {
  const { name } = await params;
  if (!isSafeSlug(name)) return badName();
  const body = await req.json();
  const parsed = AgentFrontmatterSchema.safeParse(body.frontmatter);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "frontmatter ไม่ถูกต้อง" },
      { status: 400 }
    );
  }
  // Claude Code คาดหวัง tools เป็น comma-separated string; ถ้าว่างให้ตัด key ทิ้ง
  // (ไม่มี tools = inherit ทุก tool)
  const frontmatter: Record<string, any> = { ...parsed.data };
  const tools = toolsToString(parsed.data.tools);
  if (tools) {
    frontmatter.tools = tools;
  } else {
    delete frontmatter.tools;
  }
  const content = matter.stringify(body.body ?? "", frontmatter);
  await writeFileAtomic(agentFile(name), content);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { name } = await params;
  if (!isSafeSlug(name)) return badName();
  const file = agentFile(name);
  if (!(await pathExists(file))) {
    return NextResponse.json({ error: "ไม่พบ agent นี้" }, { status: 404 });
  }
  await fs.rm(file);
  return NextResponse.json({ ok: true });
}
