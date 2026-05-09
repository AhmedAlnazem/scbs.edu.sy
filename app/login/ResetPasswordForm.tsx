"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { AuthActionState } from "@/app/_actions/auth";
import { resetPasswordAction } from "@/app/_actions/auth";
import styles from "./page.module.css";

const initialState: AuthActionState = undefined;

type LoginMode = "student" | "teacher";

export function ResetPasswordForm({
  mode,
  nextPath,
}: {
  mode: LoginMode;
  nextPath?: string;
}) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);
  const loginHref = nextPath
    ? `/login/${mode}?next=${encodeURIComponent(nextPath)}`
    : `/login/${mode}`;

  return (
    <form action={formAction} className={styles.form}>
      <input name="mode" type="hidden" value={mode} />

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
        <span className={styles.label}>مفتاح الاستعادة</span>
        <input
          autoComplete="one-time-code"
          className={styles.input}
          name="recoveryKey"
          required
          type="password"
        />
        {state?.fieldErrors?.recoveryKey ? (
          <span className={styles.error}>{state.fieldErrors.recoveryKey}</span>
        ) : null}
      </label>

      <label className={styles.field}>
        <span className={styles.label}>كلمة المرور الجديدة</span>
        <input
          autoComplete="new-password"
          className={styles.input}
          name="password"
          required
          type="password"
        />
        {state?.fieldErrors?.password ? (
          <span className={styles.error}>{state.fieldErrors.password}</span>
        ) : null}
      </label>

      <label className={styles.field}>
        <span className={styles.label}>تأكيد كلمة المرور الجديدة</span>
        <input
          autoComplete="new-password"
          className={styles.input}
          name="confirmPassword"
          required
          type="password"
        />
        {state?.fieldErrors?.confirmPassword ? (
          <span className={styles.error}>{state.fieldErrors.confirmPassword}</span>
        ) : null}
      </label>

      <div className={styles.infoPanel}>
        <p className={styles.infoTitle}>استعادة محلية</p>
        <p>أدخل مفتاح الاستعادة الموجود في ملف البيئة المحلي ثم اختر كلمة مرور جديدة.</p>
      </div>

      {state?.formError ? <div className={styles.formError}>{state.formError}</div> : null}
      {state?.successMessage ? (
        <div className={styles.formSuccess}>
          {state.successMessage}{" "}
          <Link className={styles.inlineLink} href={loginHref}>
            العودة إلى تسجيل الدخول
          </Link>
        </div>
      ) : null}

      <button className={styles.submitButton} disabled={pending} type="submit">
        {pending ? "جار تحديث كلمة المرور..." : "تحديث كلمة المرور"}
      </button>
    </form>
  );
}
