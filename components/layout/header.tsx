"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { formatUserLabel } from "@/lib/utils/format";

type HeaderProps = {
  userEmail?: string;
};

export function Header({ userEmail }: HeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Career Tracker
        </p>
        <h1 className="text-lg font-semibold text-ink">転職活動管理</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-muted sm:inline">
          {formatUserLabel(userEmail)}
        </span>
        <button
          className="rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          onClick={handleLogout}
          type="button"
        >
          ログアウト
        </button>
      </div>
    </header>
  );
}
