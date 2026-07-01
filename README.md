# Claude Config Manager

เว็บแอปสำหรับจัดการไฟล์ config ของ Claude Code บนเครื่อง (`~/.claude/`) ผ่าน UI แทนการแก้ไฟล์ตรงๆ

จัดการได้:
- `CLAUDE.md` — global memory/instructions
- `skills/*/SKILL.md` — skills
- `agents/*.md` — sub-agents (frontmatter: name, description, tools, model — `tools` เก็บเป็น comma-separated string ตามสเปกของ Claude Code)
- `settings.json` — permissions, env, hooks
- `~/.claude.json` — MCP servers ระดับ user (key `mcpServers`; Claude Code เก็บไว้ไฟล์นี้ ไม่ใช่ settings.json)

## วิธีรัน (dev)

```bash
npm install
npm run dev
```

เปิด http://localhost:3000

โดย default จะอ่าน/เขียนที่ `~/.claude/` ของเครื่องที่รัน ถ้าอยากชี้ไปโฟลเดอร์อื่น (เช่นไว้ทดสอบ) ตั้ง env var ก่อนรัน:

```bash
CLAUDE_HOME=/path/to/test-claude-home npm run dev
```

(ตำแหน่งไฟล์ MCP override ได้ด้วย `CLAUDE_JSON` — ถ้าไม่ตั้ง จะเป็นไฟล์ sibling ของ `CLAUDE_HOME` เช่น `~/.claude` → `~/.claude.json`)

## วิธีรันด้วย Docker

```bash
docker compose up -d
```

เปิด http://localhost:8888 — ปิดด้วย `docker compose down`

สิ่งที่ compose ตั้งไว้ให้แล้ว:
- **พอร์ต** bind เฉพาะ `127.0.0.1:8888` ไม่เปิดออก network ภายนอก (แอปไม่มี auth)
- **Volume** mount `~/.claude/` และ `~/.claude.json` ของ host เข้า container พร้อมตั้ง `CLAUDE_HOME` / `CLAUDE_JSON` ให้ชี้ตาม — แก้ config ใน UI แล้วมีผลกับเครื่อง host จริงทันที
- **Image** เป็น multi-stage build จาก `node:22-alpine` ใช้ Next.js standalone output

ข้อควรระวัง:
- ถ้าเครื่องยังไม่มีไฟล์ `~/.claude.json` ให้สร้างก่อนด้วย `echo '{}' > ~/.claude.json` — ไม่งั้น Docker จะสร้าง path นั้นเป็น "โฟลเดอร์" แทนไฟล์ แล้วแอปอ่านไม่ได้
- แก้โค้ดแล้วต้อง build ใหม่: `docker compose up -d --build`

## ความปลอดภัยของข้อมูล

- ทุกครั้งที่บันทึกทับไฟล์เดิม จะสำเนาไฟล์เก่าไปเก็บที่ `~/.claude/.manager-backups/<ชื่อไฟล์>.<timestamp>.bak` ก่อนเสมอ
- เขียนไฟล์แบบ atomic (เขียนไฟล์ tmp แล้ว rename ทับ) กันไฟล์พังครึ่งๆ กลางๆ ถ้าโปรเซสตายกลางคัน — ยกเว้นไฟล์ที่เป็น bind mount ใน Docker ซึ่ง rename ทับไม่ได้ จะ fallback เป็นเขียนตรง (มี backup ก่อนเสมออยู่แล้ว)
- `settings.json` และ agent frontmatter จะ validate ด้วย zod ก่อนเขียนทุกครั้ง
- `~/.claude.json` จะแก้เฉพาะ key `mcpServers` โดยคงข้อมูลอื่นไว้ทั้งหมด และถ้าไฟล์ parse ไม่ผ่านจะไม่ยอมเขียนทับเด็ดขาด
- ชื่อ agent/skill/server จาก URL และ request ถูก validate กัน path traversal ทุก endpoint

## Stack

Next.js 15 (App Router) + TypeScript + Tailwind CSS, ไม่มี database — filesystem คือ source of truth ทั้งหมด แอปนี้ตั้งใจให้รันบน `localhost` เท่านั้น ไม่มีระบบ auth
