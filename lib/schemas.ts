import { z } from "zod";

// Claude Code เก็บ tools เป็น comma-separated string ("Read, Write, Bash")
// แต่รับ array จากฝั่ง UI ด้วย แล้วค่อย normalize เป็น string ตอนเขียนไฟล์
export const AgentFrontmatterSchema = z
  .object({
    name: z.string().min(1, "ต้องมีชื่อ agent"),
    description: z.string().min(1, "ต้องมีคำอธิบาย"),
    tools: z.union([z.string(), z.array(z.string())]).optional(),
    model: z.string().optional(),
  })
  .passthrough();

export type AgentFrontmatter = z.infer<typeof AgentFrontmatterSchema>;

export function toolsToArray(tools: AgentFrontmatter["tools"]): string[] {
  if (!tools) return [];
  if (Array.isArray(tools)) return tools;
  return tools.split(",").map((t) => t.trim()).filter(Boolean);
}

export function toolsToString(tools: AgentFrontmatter["tools"]): string | undefined {
  const list = toolsToArray(tools);
  return list.length > 0 ? list.join(", ") : undefined;
}

// server ที่เพิ่มด้วย `claude mcp add` รุ่นเก่าอาจไม่มี type (default = stdio)
export const McpServerSchema = z
  .object({
    type: z.enum(["stdio", "sse", "http"]).optional(),
    command: z.string().optional(),
    args: z.array(z.string()).optional(),
    env: z.record(z.string()).optional(),
    url: z.string().optional(),
  })
  .passthrough();

export type McpServer = z.infer<typeof McpServerSchema>;

export const SettingsSchema = z
  .object({
    permissions: z
      .object({
        allow: z.array(z.string()).optional(),
        deny: z.array(z.string()).optional(),
      })
      .optional(),
    env: z.record(z.string()).optional(),
    hooks: z.record(z.any()).optional(),
  })
  .passthrough();

export type Settings = z.infer<typeof SettingsSchema>;
