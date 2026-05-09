"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { AuthActionState } from "@/app/_actions/auth";
import { loginAction } from "@/app/_actions/auth";
import styles from "./page.module.css";

const initialState: AuthActionState = undefined;

type LoginMode = "student" | "teacher";

export function LoginForm({
  mode,
  nextPath,
}: {
  mode: LoginMode;
  nextPath?: string;
}) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const isStudent = mode === "student";
  const resetHref = nextPath
    ? `/login/reset?mode=${mode}&next=${encodeURIComponent(nextPath)}`
    : `/login/reset?mode=${mode}`;

  return (
    <form action={formAction} className={styles.form}>
      <input name="mode" type="hidden" value={mode} />
      {nextPath ? <input name="next" type="hidden" value={nextPath} /> : null}

      <label className={styles.field}>
        <span className={styles.label}>اسم المستخدم أو البريد الإلكتروني</span>
        <input
          autoComplete="username"
          className={styles.input}
          name="identifier"
          required
          type="text"
        />
        {state?.fieldErrors?.identifier ? (
          <span className={styles.error}>{state.fieldErrors.identifier}</span>
        ) : null}
      </label>

      <label className={styles.field}>
        <span className={styles.label}>كلمة المرور</span>
        <input
          autoComplete="current-password"
          className={styles.input}
          name="password"
          required
          type="password"
        />
        {state?.fieldErrors?.password ? (
          <span className={styles.error}>{state.fieldErrors.password}</span>
        ) : null}
      </label>

      <div className={styles.formMetaRow}>
        <Link className={styles.inlineLink} href={resetHref}>
          نسيت كلمة المرور؟
        </Link>
      </div>

      {state?.formError ? <div className={styles.formError}>{state.formError}</div> : null}

      <button className={styles.submitButton} disabled={pending} type="submit">
        {pending
          ? "جار تسجيل الدخول..."
          : isStudent
            ? "دخول الطالب"
            : "دخول المعلمين والإدارة"}
      </button>
    </form>
  );
}
