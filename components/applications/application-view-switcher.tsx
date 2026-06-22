import Link from "next/link";

type ApplicationViewSwitcherProps = {
  currentView: "list" | "kanban";
};

function linkClass(isActive: boolean) {
  return `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-ink text-white"
      : "text-muted hover:bg-white hover:text-ink"
  }`;
}

export function ApplicationViewSwitcher({
  currentView,
}: ApplicationViewSwitcherProps) {
  return (
    <div
      aria-label="応募・選考の表示切替"
      className="inline-flex rounded-md border border-border bg-surface p-1"
    >
      <Link
        aria-current={currentView === "list" ? "page" : undefined}
        className={linkClass(currentView === "list")}
        href="/applications"
      >
        一覧
      </Link>
      <Link
        aria-current={currentView === "kanban" ? "page" : undefined}
        className={linkClass(currentView === "kanban")}
        href="/applications/kanban"
      >
        カンバン
      </Link>
    </div>
  );
}
