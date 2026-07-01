import { NextResponse } from "next/server";
import fs from "fs/promises";
import matter from "gray-matter";
import { claudePath, pathExists, ensureDir, readFileSafe } from "@/lib/claudeHome";
import { writeFileAtomic } from "@/lib/backup";

const SKILLS_DIR = claudePath("skills");

export async function GET() {
  if (!(await pathExists(SKILLS_DIR))) {
    return NextResponse.json({ skills: [] });
  }
  const entries = await fs.readdir(SKILLS_DIR, { withFileTypes: true });
  const skills = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillMdPath = `${SKILLS_DIR}/${entry.name}/SKILL.md`;
    const raw = await readFileSafe(skillMdPath);
    let name = entry.name;
    let description = "";
    if (raw) {
      try {
        const { data } = matter(raw);
        name = data.name ?? entry.name;
        description = data.description ?? "";
      } catch {
        // ignore parse errors, still list the skill
      }
    }
    skills.push({ slug: entry.name, name, description, hasFile: !!raw });
  }
  return NextResponse.json({ skills });
}

export async function POST(req: Request) {
  const { slug, description } = await req.json();
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: "ชื่อ skill ต้องเป็นตัวพิมพ์เล็ก ตัวเลข และ - เท่านั้น" },
      { status: 400 }
    );
  }
  const dir = `${SKILLS_DIR}/${slug}`;
  if (await pathExists(dir)) {
    return NextResponse.json({ error: "มี skill ชื่อนี้อยู่แล้ว" }, { status: 409 });
  }
  await ensureDir(dir);
  const template = matter.stringify(
    `# ${slug}\n\nอธิบายวิธีใช้งาน skill นี้ที่นี่\n`,
    { name: slug, description: description || "อธิบาย skill นี้สั้นๆ" }
  );
  await writeFileAtomic(`${dir}/SKILL.md`, template);
  return NextResponse.json({ ok: true, slug });
}
