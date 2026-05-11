"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Role } from "@/generated/prisma";
import { hashPassword, normalizeEmail, verifyRecoveryKey } from "@/app/_lib/auth-crypto";
import {
  authenticateUser,
  clearCurrentSession,
  createUserSession,
  findUserByEmail,
  findUserByUsername,
} from "@/app/_lib/session";
import { prisma } from "@/app/_lib/prisma";

export type AuthActionState = {
  fieldErrors?: {
    mode?: string;
    name?: string;
    studentClass?: string;
    identifier?: string;
    email?: string;
    password?: string;
    registrationKey?: string;
    recoveryKey?: string;
    confirmPassword?: string;
  };
  formError?: string;
  successMessage?: string;
} | undefined;

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function safeNextPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  if (value.startsWith("/login") || value.startsWith("/register")) {
    return "/dashboard";
  }

  return value;
}

function normalizeUsernameCandidate(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "");
}

async function buildUniqueUsername(name: string, email: string) {
  const emailBase = normalizeUsernameCandidate(email.split("@")[0] ?? "");
  const nameBase = normalizeUsernameCandidate(name.replace(/\s+/g, ""));
  const base = emailBase || nameBase || "student";
  let candidate = base;
  let suffix = 1;

  while (await findUserByUsername(candidate)) {
    suffix += 1;
    candidate = `${base}${suffix}`;
  }

  return candidate;
}

function validateName(name: string) {
  if (name.length < 2) {
    return "Name must be at least 2 characters.";
  }

  return null;
}

function validateStudentClass(studentClass: string) {
  const allowedClasses = [
    "الأول الثانوي",
    "الثاني ثانوي",
    "الثالث الثانوي",
  ];

  if (studentClass.length < 1) {
    return "Class is required.";
  }

  if (!allowedClasses.includes(studentClass)) {
    return "Select a valid class.";
  }

  return null;
}

function validateIdentifier(identifier: string) {
  if (identifier.length < 3) {
    return "Username or email is required.";
  }

  return null;
}

function validateLoginMode(mode: string) {
  if (mode === "student" || mode === "teacher") {
    return mode;
  }

  return "student";
}

function validateRegisterMode(mode: string) {
  if (mode === "student" || mode === "teacher") {
    return mode;
  }

  return "student";
}

function validateEmail(email: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email))) {
    return "Enter a valid email address.";
  }

  return null;
}

function validatePassword(password: string) {
  if (password.length < 7) {
    return "Password must be at least 7 characters.";
  }

  return null;
}

export async function loginAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const mode = validateLoginMode(readText(formData, "mode"));
  const identifier = readText(formData, "identifier");
  const password = readText(formData, "password");
  const nextPath = safeNextPath(readText(formData, "next") || "/dashboard");

  const identifierError = validateIdentifier(identifier);

  if (identifierError) {
    return {
      fieldErrors: {
        identifier: identifierError,
      },
    };
  }

  if (!password) {
    return {
      fieldErrors: {
        password: "Password is required.",
      },
    };
  }

  const user = await authenticateUser(identifier, password);

  if (!user) {
    return {
      formError: "Username/email or password is incorrect.",
    };
  }

  const isStudentLogin = mode === "student";
  const isStudentUser = user.role === Role.STUDENT;

  if (isStudentLogin && !isStudentUser) {
    return {
      formError: "Use the teacher and administration portal for this account.",
    };
  }

  if (!isStudentLogin && isStudentUser) {
    return {
      formError: "Use the student portal for this account.",
    };
  }

  await createUserSession(user.id);
  revalidatePath("/", "layout");
  redirect(nextPath);
}

export async function registerAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const mode = validateRegisterMode(readText(formData, "mode"));
  const name = readText(formData, "name");
  const studentClass = readText(formData, "studentClass");
  const email = readText(formData, "email");
  const password = readText(formData, "password");
  const registrationKey = readText(formData, "registrationKey");
  const configuredTeacherRegistrationKey = process.env.TEACHER_REGISTRATION_KEY?.trim();
  const isTeacherRegistration = mode === "teacher";

  const fieldErrors: NonNullable<AuthActionState>["fieldErrors"] = {};
  const nameError = validateName(name);
  const studentClassError = isTeacherRegistration ? null : validateStudentClass(studentClass);
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  if (nameError) {
    fieldErrors.name = nameError;
  }

  if (studentClassError) {
    fieldErrors.studentClass = studentClassError;
  }

  if (emailError) {
    fieldErrors.email = emailError;
  }

  if (passwordError) {
    fieldErrors.password = passwordError;
  }

  if (isTeacherRegistration && !registrationKey) {
    fieldErrors.registrationKey = "Registration key is required.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  if (isTeacherRegistration) {
    if (!configuredTeacherRegistrationKey) {
      return {
        formError: "Teacher registration is not configured yet.",
      };
    }

    if (!verifyRecoveryKey(registrationKey, configuredTeacherRegistrationKey)) {
      return {
        fieldErrors: {
          registrationKey: "Registration key is incorrect.",
        },
      };
    }
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    return {
      fieldErrors: {
        email: "This email address is already registered.",
      },
    };
  }

  const username = await buildUniqueUsername(name, normalizedEmail);

  const user = await prisma.user.create({
    data: {
      name,
      studentClass: isTeacherRegistration ? null : studentClass,
      username,
      email: normalizedEmail,
      password: await hashPassword(password),
      role: isTeacherRegistration ? Role.TEACHER : Role.STUDENT,
    },
  });

  await createUserSession(user.id);
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearCurrentSession();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function resetPasswordAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const mode = validateLoginMode(readText(formData, "mode"));
  const identifier = readText(formData, "identifier");
  const recoveryKey = readText(formData, "recoveryKey");
  const password = readText(formData, "password");
  const confirmPassword = readText(formData, "confirmPassword");
  const configuredRecoveryKey = process.env.PASSWORD_RESET_RECOVERY_KEY?.trim();

  const fieldErrors: NonNullable<AuthActionState>["fieldErrors"] = {};
  const identifierError = validateIdentifier(identifier);
  const passwordError = validatePassword(password);

  if (identifierError) {
    fieldErrors.identifier = identifierError;
  }

  if (!recoveryKey) {
    fieldErrors.recoveryKey = "Recovery key is required.";
  }

  if (passwordError) {
    fieldErrors.password = passwordError;
  }

  if (confirmPassword !== password) {
    fieldErrors.confirmPassword = "Passwords do not match.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  if (!configuredRecoveryKey) {
    return {
      formError: "Password recovery is not configured yet.",
    };
  }

  if (!verifyRecoveryKey(recoveryKey, configuredRecoveryKey)) {
    return {
      fieldErrors: {
        recoveryKey: "Recovery key is incorrect.",
      },
    };
  }

  const user = await findUserByUsername(identifier) ?? await findUserByEmail(identifier);

  if (!user) {
    return {
      formError: "No account was found for that username or email.",
    };
  }

  const isStudentReset = mode === "student";
  const isStudentUser = user.role === Role.STUDENT;

  if (isStudentReset && !isStudentUser) {
    return {
      formError: "Use the teacher and administration recovery page for this account.",
    };
  }

  if (!isStudentReset && isStudentUser) {
    return {
      formError: "Use the student recovery page for this account.",
    };
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: await hashPassword(password),
    },
  });

  await prisma.session.deleteMany({
    where: {
      userId: user.id,
    },
  });

  return {
    successMessage: "Password updated. You can return to login and sign in with the new password.",
  };
}
