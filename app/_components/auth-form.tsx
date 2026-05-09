"use client";

import { useActionState } from "react";

import type { AuthActionState } from "@/app/_actions/auth";

type AuthFormProps = {
  action: (
    state: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  fields: Array<{
    name: "name" | "email" | "password";
    label: string;
    type: "text" | "email" | "password";
    autoComplete: string;
  }>;
  submitLabel: string;
  pendingLabel: string;
  nextPath?: string;
};

const initialState: AuthActionState = undefined;

export function AuthForm({
  action,
  fields,
  submitLabel,
  pendingLabel,
  nextPath,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      {nextPath ? <input name="next" type="hidden" value={nextPath} /> : null}

      {fields.map((field) => (
        <label key={field.name} className="block space-y-2 text-sm text-[var(--foreground)]">
          <span className="font-medium">{field.label}</span>
          <input
            autoComplete={field.autoComplete}
            className="themeInput w-full rounded-2xl px-4 py-3 outline-none"
            name={field.name}
            required
            type={field.type}
          />
          {state?.fieldErrors?.[field.name] ? (
            <p className="text-sm text-[var(--accent)]">{state.fieldErrors[field.name]}</p>
          ) : null}
        </label>
      ))}

      {state?.formError ? (
        <div className="rounded-2xl border border-[rgba(163,71,45,0.2)] bg-[rgba(163,71,45,0.08)] px-4 py-3 text-sm text-[var(--accent-strong)]">
          {state.formError}
        </div>
      ) : null}

      <button
        className="themeButton w-full rounded-2xl px-4 py-3 text-sm font-medium"
        disabled={pending}
        type="submit"
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
