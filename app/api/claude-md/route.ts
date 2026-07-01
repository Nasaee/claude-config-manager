import { NextResponse } from "next/server";
import { claudePath, readFileSafe } from "@/lib/claudeHome";
import { writeFileAtomic } from "@/lib/backup";

const FILE = claudePath("CLAUDE.md");

export async function GET() {
  const content = (await readFileSafe(FILE)) ?? "";
  return NextResponse.json({ content });
}

export async function PUT(req: Request) {
  const { content } = await req.json();
  if (typeof content !== "string") {
    return NextResponse.json({ error: "content ต้องเป็น string" }, { status: 400 });
  }
  await writeFileAtomic(FILE, content);
  return NextResponse.json({ ok: true });
}
