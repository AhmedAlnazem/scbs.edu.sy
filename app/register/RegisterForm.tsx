"use client";

import { useActionState } from "react";

import type { AuthActionState } from "@/app/_actions/auth";
import { registerAction } from "@/app/_actions/auth";
import styles from "@/app/login/page.module.css";

const initialState: AuthActionState = undefined;

const classOptions = ["الأول الثانوي", "الثاني ثانوي", "الثالث الثانوي"] as const;

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <label className={styles.field}>
        <span className={styles.label}>الاسم الكامل</span>
        <input autoComplete="name" className={styles.input} name="name" required type="text" />
        {state?.fieldErrors?.name ? (
          <span className={styles.error}>{state.fieldErrors.name}</span>
        ) : null}
      </label>

      <label className={styles.field}>
        <span className={styles.label}>الصف</span>
        <select className={styles.input} defaultValue="" name="studentClass" required>
          <option disabled value="">
            اختر الصف
          </option>
          {classOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {state?.fieldErrors?.studentClass ? (
          <span className={styles.error}>{state.fieldErrors.studentClass}</span>
        ) : null}
      </label>

      <label className={styles.field}>
        <span className={styles.label}>البريد الإلكتروني</span>
        <input autoComplete="email" className={styles.input} name="email" required type="email" />
        {state?.fieldErrors?.email ? (
          <span className={styles.error}>{state.fieldErrors.email}</span>
        ) : null}
      </label>

      <label className={styles.field}>
        <span className={styles.label}>كلمة المرور</span>
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

      {state?.formError ? <div className={styles.formError}>{state.formError}</div> : null}

      <button className={styles.submitButton} disabled={pending} type="submit">
        {pending ? "جار إنشاء الحساب..." : "إنشاء الحساب"}
      </button>
    </form>
  );
}
