"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "dashboard", path: "~/.claude/" },
  { href: "/claude-md", label: "claude.md", path: "~/.claude/CLAUDE.md" },
  { href: "/skills", label: "skills", path: "~/.claude/skills/" },
  { href: "/agents", label: "agents", path: "~/.claude/agents/" },
  { href: "/mcp", label: "mcp servers", path: "~/.claude.json#mcpServers" },
  { href: "/settings", label: "settings", path: "~/.claude/settings.json" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-line bg-surface/60 flex flex-col">
      <div className="px-5 py-5 border-b border-line">
        <p className="font-mono text-xs tracking-[0.2em] text-ember uppercase">claude</p>
        <p className="font-mono text-sm text-paper">config manager</p>
      </div>
      <nav className="flex-1 py-3">
        {NAV.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex flex-col gap-0.5 px-5 py-2.5 border-l-2 transition-colors ${
                active ? "border-ember bg-ink/40" : "border-transparent hover:border-line hover:bg-ink/20"
              }`}
            >
              <span className={`font-mono text-[13px] ${active ? "text-ember" : "text-paper/80 group-hover:text-paper"}`}>
                {active ? "$ " : "  "}
                {item.label}
              </span>
              <span className="font-mono text-[10px] text-paper/30 truncate">{item.path}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-line">
        <p className="font-mono text-[10px] text-paper/30">local only · 127.0.0.1</p>
      </div>
    </aside>
  );
}
