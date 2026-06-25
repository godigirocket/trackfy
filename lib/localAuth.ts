"use client";

const LOCAL_USER_KEY = "tf_local_user";
const LOCAL_SESSION_KEY = "tf_local_session";
const LOCAL_USERS_KEY = "tf_local_users";
const ADMIN_EMAILS = ["emailjg4@gmail.com"];

export type LocalRole = "admin" | "user";
export type LocalPlan = "starter" | "pro" | "unlimited";
export type LocalUserStatus = "active" | "blocked";

export interface LocalLimits {
  users: number | "unlimited";
  adAccounts: number | "unlimited";
  integrations: number | "unlimited";
  reports: number | "unlimited";
  automations: number | "unlimited";
}

export interface LocalUser {
  email: string;
  name: string;
  role?: LocalRole;
  plan?: LocalPlan;
  status?: LocalUserStatus;
  createdAt?: string;
}

export const PLAN_LABELS: Record<LocalPlan, string> = {
  starter: "Starter",
  pro: "Pro",
  unlimited: "Ilimitado",
};

export const PLAN_LIMITS: Record<LocalPlan, LocalLimits> = {
  starter: {
    users: 1,
    adAccounts: 1,
    integrations: 2,
    reports: 5,
    automations: 3,
  },
  pro: {
    users: 10,
    adAccounts: 5,
    integrations: 5,
    reports: 50,
    automations: 25,
  },
  unlimited: {
    users: "unlimited",
    adAccounts: "unlimited",
    integrations: "unlimited",
    reports: "unlimited",
    automations: "unlimited",
  },
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isAdminEmail(email: string) {
  return ADMIN_EMAILS.includes(normalizeEmail(email));
}

function withRole(user: LocalUser): LocalUser {
  const email = normalizeEmail(user.email);
  const admin = isAdminEmail(email);
  return {
    ...user,
    email,
    role: admin ? "admin" : user.role ?? "user",
    plan: admin ? "unlimited" : user.plan ?? "starter",
    status: user.status ?? "active",
  };
}

export function createLocalSession(user: LocalUser) {
  if (typeof window === "undefined") return;
  const localUser = withRole(user);
  upsertLocalUser(localUser);
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
  localStorage.setItem(
    LOCAL_SESSION_KEY,
    JSON.stringify({ email: localUser.email, role: localUser.role, createdAt: new Date().toISOString() })
  );
}

export function getLocalUser(): LocalUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(LOCAL_USER_KEY);
  if (!raw) return null;

  try {
    return withRole(JSON.parse(raw) as LocalUser);
  } catch {
    return null;
  }
}

export function getLocalUsers(): LocalUser[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LOCAL_USERS_KEY);
  let users: LocalUser[] = [];
  try {
    users = raw ? JSON.parse(raw) as LocalUser[] : [];
  } catch {
    users = [];
  }
  const normalized = users.map(withRole);
  if (!normalized.some((u) => normalizeEmail(u.email) === ADMIN_EMAILS[0])) {
    normalized.unshift({
      email: ADMIN_EMAILS[0],
      name: "Juan Goes",
      role: "admin",
      createdAt: new Date().toISOString(),
    });
  }
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(normalized));
  return normalized;
}

export function findLocalUser(email: string): LocalUser | null {
  if (typeof window === "undefined") return null;
  const normalizedEmail = normalizeEmail(email);
  return getLocalUsers().find((u) => normalizeEmail(u.email) === normalizedEmail) ?? null;
}

export function upsertLocalUser(user: LocalUser) {
  if (typeof window === "undefined") return;
  const localUser = withRole({
    ...user,
    createdAt: user.createdAt ?? new Date().toISOString(),
  });
  const users = getLocalUsers();
  const next = users.some((u) => normalizeEmail(u.email) === localUser.email)
    ? users.map((u) => normalizeEmail(u.email) === localUser.email ? { ...u, ...localUser } : u)
    : [...users, localUser];
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(next));
}

export function removeLocalUser(email: string) {
  if (typeof window === "undefined") return;
  const normalizedEmail = normalizeEmail(email);
  if (isAdminEmail(normalizedEmail)) return;
  localStorage.setItem(
    LOCAL_USERS_KEY,
    JSON.stringify(getLocalUsers().filter((u) => normalizeEmail(u.email) !== normalizedEmail))
  );
}

export function setLocalUserRole(email: string, role: LocalRole) {
  if (typeof window === "undefined") return;
  const normalizedEmail = normalizeEmail(email);
  const nextRole = isAdminEmail(normalizedEmail) ? "admin" : role;
  localStorage.setItem(
    LOCAL_USERS_KEY,
    JSON.stringify(getLocalUsers().map((u) => (
      normalizeEmail(u.email) === normalizedEmail ? { ...u, role: nextRole } : u
    )))
  );
}

export function setLocalUserPlan(email: string, plan: LocalPlan) {
  if (typeof window === "undefined") return;
  const normalizedEmail = normalizeEmail(email);
  const nextPlan = isAdminEmail(normalizedEmail) ? "unlimited" : plan;
  localStorage.setItem(
    LOCAL_USERS_KEY,
    JSON.stringify(getLocalUsers().map((u) => (
      normalizeEmail(u.email) === normalizedEmail ? withRole({ ...u, plan: nextPlan }) : u
    )))
  );
}

export function setLocalUserStatus(email: string, status: LocalUserStatus) {
  if (typeof window === "undefined") return;
  const normalizedEmail = normalizeEmail(email);
  const nextStatus = isAdminEmail(normalizedEmail) ? "active" : status;
  localStorage.setItem(
    LOCAL_USERS_KEY,
    JSON.stringify(getLocalUsers().map((u) => (
      normalizeEmail(u.email) === normalizedEmail ? withRole({ ...u, status: nextStatus }) : u
    )))
  );
}

export function getLocalUserLimits(user: LocalUser | null): LocalLimits {
  return PLAN_LIMITS[withRole(user ?? { email: "", name: "" }).plan ?? "starter"];
}

export function formatLimit(value: number | "unlimited") {
  return value === "unlimited" ? "Sem limite" : value.toString();
}

export function hasLocalSession() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(LOCAL_SESSION_KEY);
}

export function clearLocalSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LOCAL_SESSION_KEY);
}
