"use client";

import { useFormStatus } from "react-dom";

type ToggleTaskCompletionButtonProps = {
  isCompleted: boolean;
};

export function ToggleTaskCompletionButton({
  isCompleted,
}: ToggleTaskCompletionButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending
        ? "更新中"
        : isCompleted
          ? "未完了に戻す"
          : "完了にする"}
    </button>
  );
}
