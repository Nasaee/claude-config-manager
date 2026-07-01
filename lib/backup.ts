import fs from "fs/promises";
import path from "path";
import { CLAUDE_HOME, ensureDir, pathExists } from "./claudeHome";

const BACKUP_DIR = path.join(CLAUDE_HOME, ".manager-backups");

// เก็บสำเนาไฟล์เดิมไว้ก่อนเขียนทับทุกครั้ง กันพลาดแล้วย้อนกลับไม่ได้
export async function backupIfExists(targetPath: string) {
  if (!(await pathExists(targetPath))) return null;
  await ensureDir(BACKUP_DIR);
  const base = path.basename(targetPath);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(BACKUP_DIR, `${base}.${stamp}.bak`);
  await fs.copyFile(targetPath, backupPath);
  return backupPath;
}

// เขียนไฟล์แบบ atomic: เขียนลงไฟล์ tmp ก่อนแล้วค่อย rename ทับของจริง
// ป้องกันไฟล์พังครึ่งๆ กลางๆ ถ้า process ตายกลางคัน
export async function writeFileAtomic(targetPath: string, content: string) {
  await ensureDir(path.dirname(targetPath));
  await backupIfExists(targetPath);
  const tmpPath = `${targetPath}.tmp-${process.pid}-${Date.now()}`;
  await fs.writeFile(tmpPath, content, "utf-8");
  try {
    await fs.rename(tmpPath, targetPath);
  } catch (err: any) {
    // rename ทับ mount point ไม่ได้ (เช่น ~/.claude.json ที่ bind mount เข้า Docker
    // เป็นไฟล์เดี่ยว จะได้ EBUSY) — เขียนตรงแทน ยอมเสีย atomicity เพราะมี backup แล้ว
    if (err?.code === "EBUSY" || err?.code === "EXDEV" || err?.code === "EPERM") {
      await fs.writeFile(targetPath, content, "utf-8");
      await fs.rm(tmpPath, { force: true });
    } else {
      await fs.rm(tmpPath, { force: true });
      throw err;
    }
  }
}
