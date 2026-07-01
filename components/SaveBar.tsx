"use client";

export default function SaveBar({
  status,
  message,
  onSave,
  saving,
}: {
  status: "idle" | "success" | "error";
  message?: string;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-t border-line bg-surface px-5 py-3">
      <p className="font-mono text-[12px]">
        {status === "success" && <span className="text-moss">✓ saved · backup written</span>}
        {status === "error" && <span className="text-red-400">✗ {message}</span>}
        {status === "idle" && (
          <span className="text-paper/40">unsaved changes are not written until you save</span>
        )}
      </p>
      <button
        onClick={onSave}
        disabled={saving}
        className="font-mono text-[12px] uppercase tracking-wider bg-ember/90 hover:bg-ember text-ink px-4 py-2 rounded disabled:opacity-50"
      >
        {saving ? "saving..." : "save changes"}
      </button>
    </div>
  );
}
