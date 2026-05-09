"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  className?: string;
} & Omit<React.ComponentProps<"button">, "children" | "type">;

export function SubmitButton({
  idleLabel,
  pendingLabel,
  className,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button {...props} className={className} disabled={pending || props.disabled} type="submit">
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
