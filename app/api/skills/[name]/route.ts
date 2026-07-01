import { NextResponse } from "next/server";
import fs from "fs/promises";
import { claudePath, isSafeSlug, pathExists, readFileSafe } from "@/lib/claudeHome";
import { writeFileAtomic } from "@/lib/backup";

function skillFile(name: string) {
  return claudePath("skills", name, "SKILL.md");
}

function badName() {
  return NextResponse.json({ error: "ชื่อ skill ไม่ถูกต้อง" }, { status: 400 });
}

type Params = { params: Promise<{ name: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { name } = await params;
  if (!isSafeSlug(name)) return badName();
  const content = await readFileSafe(skillFile(name));
  if (content === null) {
    return NextResponse.json({ error: "ไม่พบ skill นี้" }, { status: 404 });
  }
  return NextResponse.json({ content });
}

export async function PUT(req: Request, { params }: Params) {
  const { name } = await params;
  if (!isSafeSlug(name)) return badName();
  const { content } = await req.json();
  if (typeof content !== "string") {
    return NextResponse.json({ error: "content ต้องเป็น string" }, { status: 400 });
  }
  await writeFileAtomic(skillFile(name), content);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { name } = await params;
  if (!isSafeSlug(name)) return badName();
  const dir = claudePath("skills", name);
  if (!(await pathExists(dir))) {
    return NextResponse.json({ error: "ไม่พบ skill นี้" }, { status: 404 });
  }
  await fs.rm(dir, { recursive: true, force: true });
  return NextResponse.json({ ok: true });
}
