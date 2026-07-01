import { NextResponse } from "next/server";
import { claudePath, readFileSafe } from "@/lib/claudeHome";
import { writeFileAtomic } from "@/lib/backup";
import { SettingsSchema } from "@/lib/schemas";

const FILE = claudePath("settings.json");

export async function GET() {
  const raw = (await readFileSafe(FILE)) ?? "{}";
  return NextResponse.json({ content: raw });
}

export async function PUT(req: Request) {
  const { content } = await req.json();
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    return NextResponse.json({ error: "ไม่ใช่ JSON ที่ถูกต้อง" }, { status: 400 });
  }
  const result = SettingsSchema.safeParse(parsed);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message ?? "รูปแบบไม่ถูกต้อง" },
      { status: 400 }
    );
  }
  await writeFileAtomic(FILE, JSON.stringify(parsed, null, 2));
  return NextResponse.json({ ok: true });
}
