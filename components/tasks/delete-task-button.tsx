"use client";

import { type MouseEvent } from "react";
import { useFormStatus } from "react-dom";

type DeleteTaskButtonProps = {
  title: string;
};

export function DeleteTaskButton({ title }: DeleteTaskButtonProps) {
  const { pending } = useFormStatus();

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    const isConfirmed = window.confirm(
      `「${title}」のタスクを削除します。削除後は元に戻せません。よろしいですか？`,
    );

    if (!isConfirmed) {
      event.preventDefault();
    }
  }

  return (
    <button
      className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      onClick={handleClick}
      type="submit"
    >
      {pending ? "削除中" : "削除"}
    </button>
  );
}
