import { NextResponse } from "next/server";
import fs from "fs/promises";
import matter from "gray-matter";
import { claudePath, pathExists, readFileSafe } from "@/lib/claudeHome";
import { writeFileAtomic } from "@/lib/backup";
import { AgentFrontmatterSchema, toolsToString } from "@/lib/schemas";

const AGENTS_DIR = claudePath("agents");

export async function GET() {
  if (!(await pathExists(AGENTS_DIR))) {
    return NextResponse.json({ agents: [] });
  }
  const entries = await fs.readdir(AGENTS_DIR, { withFileTypes: true });
  const agents = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const slug = entry.name.replace(/\.md$/, "");
    const raw = await readFileSafe(`${AGENTS_DIR}/${entry.name}`);
    let name = slug;
    let description = "";
    let valid = true;
    if (raw) {
      const { data } = matter(raw);
      const result = AgentFrontmatterSchema.safeParse(data);
      valid = result.success;
      name = data.name ?? slug;
      description = data.description ?? "";
    }
    agents.push({ slug, name, description, valid });
  }
  return NextResponse.json({ agents });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { slug } = body;
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: "ชื่อ agent ต้องเป็นตัวพิมพ์เล็ก ตัวเลข และ - เท่านั้น" },
      { status: 400 }
    );
  }
  const filePath = `${AGENTS_DIR}/${slug}.md`;
  if (await pathExists(filePath)) {
    return NextResponse.json({ error: "มี agent ชื่อนี้อยู่แล้ว" }, { status: 409 });
  }
  // tools เป็น comma-separated string ตามสเปก Claude Code; ถ้าไม่ระบุ = inherit ทุก tool
  const frontmatter: Record<string, any> = {
    name: slug,
    description: body.description || "อธิบาย agent นี้สั้นๆ",
    model: body.model ?? "inherit",
  };
  const tools = toolsToString(body.tools);
  if (tools) frontmatter.tools = tools;
  const content = matter.stringify(body.body || "คุณคือ subagent ที่ทำหน้าที่...\n", frontmatter);
  await writeFileAtomic(filePath, content);
  return NextResponse.json({ ok: true, slug });
}
