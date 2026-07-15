"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type ConfirmSubmitButtonProps = {
  children: ReactNode;
  confirmMessage?: string;
  className?: string;
};

/** Form submit butonu: istenirse onay sorar, gönderim sırasında pending gösterir. */
export function ConfirmSubmitButton({
  children,
  confirmMessage,
  className,
}: ConfirmSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
      className={
        className ??
        "min-h-11 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {pending ? "İşleniyor..." : children}
    </button>
  );
}
