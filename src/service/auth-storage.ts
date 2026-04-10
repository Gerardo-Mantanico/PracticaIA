const AUTH_TOKEN_KEY = "token";
const AUTH_USER_KEY = "auth_user";
const PENDING_2FA_EMAIL_KEY = "2fa_user_email";
const DEMO_USER_KEY = "demo_auth_user";
const DEMO_TOKEN_PREFIX = "demo-token-";

const isBrowser = () => globalThis.window != null;

const getCookieSecurityFlags = () => {
  if (!isBrowser()) {
    return "; SameSite=Strict";
  }

  return globalThis.window.location.protocol === "https:"
    ? "; SameSite=Strict; Secure"
    : "; SameSite=Strict";
};

export const getStoredToken = (): string | null => {
  if (!isBrowser()) {
    return null;
  }

  return sessionStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
};

export const storeAuthUser = (user: unknown, options: { rememberMe?: boolean } = {}) => {
  if (!isBrowser() || !user) {
    return;
  }

  const rememberMe = Boolean(options.rememberMe);
  const serialized = JSON.stringify(user);

  if (rememberMe) {
    localStorage.setItem(AUTH_USER_KEY, serialized);
    sessionStorage.removeItem(AUTH_USER_KEY);
    return;
  }

  sessionStorage.setItem(AUTH_USER_KEY, serialized);
  localStorage.removeItem(AUTH_USER_KEY);
};

export const getStoredAuthUser = <T = unknown>(): T | null => {
  if (!isBrowser()) {
    return null;
  }

  const raw = sessionStorage.getItem(AUTH_USER_KEY) || localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const isDemoToken = (token?: string | null) =>
  Boolean(token && String(token).startsWith(DEMO_TOKEN_PREFIX));

export const storeDemoUser = (user: unknown, options: { rememberMe?: boolean } = {}) => {
  if (!isBrowser() || !user) {
    return;
  }

  const rememberMe = Boolean(options.rememberMe);
  const serialized = JSON.stringify(user);

  if (rememberMe) {
    localStorage.setItem(DEMO_USER_KEY, serialized);
    sessionStorage.removeItem(DEMO_USER_KEY);
    return;
  }

  sessionStorage.setItem(DEMO_USER_KEY, serialized);
  localStorage.removeItem(DEMO_USER_KEY);
};

export const getStoredDemoUser = <T = unknown>(): T | null => {
  if (!isBrowser()) {
    return null;
  }

  const raw = sessionStorage.getItem(DEMO_USER_KEY) || localStorage.getItem(DEMO_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const persistAuthSession = (token: string, options: { rememberMe?: boolean } = {}) => {
  if (!isBrowser() || !token) {
    return;
  }

  const rememberMe = Boolean(options.rememberMe);

  if (rememberMe) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  } else {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  const maxAge = rememberMe ? "; Max-Age=604800" : "";
  document.cookie = `${AUTH_TOKEN_KEY}=${encodeURIComponent(token)}; Path=/${maxAge}${getCookieSecurityFlags()}`;
};

export const clearAuthSession = () => {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(DEMO_USER_KEY);
  sessionStorage.removeItem(DEMO_USER_KEY);
  document.cookie = `${AUTH_TOKEN_KEY}=; Path=/; Max-Age=0${getCookieSecurityFlags()}`;
};

export const storePendingTwoFactorEmail = (email: string) => {
  if (!isBrowser()) {
    return;
  }

  sessionStorage.setItem(PENDING_2FA_EMAIL_KEY, email);
};

export const getPendingTwoFactorEmail = (): string => {
  if (!isBrowser()) {
    return "";
  }

  return sessionStorage.getItem(PENDING_2FA_EMAIL_KEY) || "";
};

export const clearPendingTwoFactorEmail = () => {
  if (!isBrowser()) {
    return;
  }

  sessionStorage.removeItem(PENDING_2FA_EMAIL_KEY);
};