import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export type GoogleAdsConnectionStatus = "active" | "needs_reauth" | "error";

export interface GoogleAdsConnection {
  id: string;
  user_id: string;
  customer_id: string;
  login_customer_id?: string;
  refresh_token: string;
  access_token?: string;
  access_token_expires_at?: string;
  scope: string;
  status: GoogleAdsConnectionStatus;
  last_error?: string;
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PublicGoogleAdsConnection {
  id: string;
  user_id: string;
  customer_id: string;
  login_customer_id?: string;
  scope: string;
  status: GoogleAdsConnectionStatus;
  last_error?: string;
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
}

const SCOPE = "https://www.googleapis.com/auth/adwords";
const STORE_PATH = path.join(process.cwd(), ".data", "google-ads-connections.json");
const CONFIG_PATH = path.join(process.cwd(), ".data", "google-ads-config.json");

export const GOOGLE_ADS_API_VERSION = process.env.GOOGLE_ADS_API_VERSION || "v22";
export const GOOGLE_ADS_BASE = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`;

interface StoredGoogleAdsAppConfig {
  client_id?: string;
  client_secret?: string;
  redirect_uri?: string;
  developer_token?: string;
  api_version?: string;
  updated_at?: string;
}

export interface GoogleAdsAppConfig {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  developerToken?: string;
  apiVersion: string;
  updatedAt?: string;
}

export interface PublicGoogleAdsAppConfig {
  oauthConfigured: boolean;
  developerTokenConfigured: boolean;
  clientIdConfigured: boolean;
  clientSecretConfigured: boolean;
  redirectUriConfigured: boolean;
  redirectUri?: string;
  apiVersion: string;
  updatedAt?: string;
}

export function cleanCustomerId(value = "") {
  return value.replace(/\D/g, "");
}

function encryptionKey() {
  const raw = process.env.GOOGLE_ADS_TOKEN_ENCRYPTION_KEY || process.env.GOOGLE_ADS_CLIENT_SECRET || "trackfy-dev-google-ads-encryption-key";
  return crypto.createHash("sha256").update(raw).digest();
}

export function encryptSecret(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

export function decryptSecret(value: string) {
  const [ivRaw, tagRaw, encryptedRaw] = value.split(".");
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivRaw, "base64"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

async function ensureStore() {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.writeFile(STORE_PATH, "[]", "utf8");
  }
}

async function readStoredConfig(): Promise<StoredGoogleAdsAppConfig> {
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf8");
    return JSON.parse(raw) as StoredGoogleAdsAppConfig;
  } catch {
    return {};
  }
}

async function writeStoredConfig(config: StoredGoogleAdsAppConfig) {
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");
}

function decryptOptionalSecret(value?: string) {
  if (!value) return undefined;
  try {
    return decryptSecret(value);
  } catch {
    return undefined;
  }
}

export async function getGoogleAdsAppConfig(): Promise<GoogleAdsAppConfig> {
  const stored = await readStoredConfig();
  return {
    clientId: process.env.GOOGLE_ADS_CLIENT_ID || stored.client_id,
    clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || decryptOptionalSecret(stored.client_secret),
    redirectUri: process.env.GOOGLE_ADS_REDIRECT_URI || stored.redirect_uri,
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || decryptOptionalSecret(stored.developer_token),
    apiVersion: process.env.GOOGLE_ADS_API_VERSION || stored.api_version || "v22",
    updatedAt: stored.updated_at,
  };
}

export async function saveGoogleAdsAppConfig(input: {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  developerToken?: string;
  apiVersion?: string;
}) {
  const stored = await readStoredConfig();
  const next: StoredGoogleAdsAppConfig = {
    ...stored,
    updated_at: new Date().toISOString(),
  };
  if (input.clientId !== undefined) next.client_id = input.clientId.trim();
  if (input.clientSecret !== undefined && input.clientSecret.trim()) next.client_secret = encryptSecret(input.clientSecret.trim());
  if (input.redirectUri !== undefined) next.redirect_uri = input.redirectUri.trim();
  if (input.developerToken !== undefined && input.developerToken.trim()) next.developer_token = encryptSecret(input.developerToken.trim());
  if (input.apiVersion !== undefined) next.api_version = input.apiVersion.trim() || "v22";
  await writeStoredConfig(next);
  return getGoogleAdsAppConfig();
}

export function publicGoogleAdsAppConfig(config: GoogleAdsAppConfig): PublicGoogleAdsAppConfig {
  return {
    oauthConfigured: !!(config.clientId && config.clientSecret && config.redirectUri),
    developerTokenConfigured: !!config.developerToken,
    clientIdConfigured: !!config.clientId,
    clientSecretConfigured: !!config.clientSecret,
    redirectUriConfigured: !!config.redirectUri,
    redirectUri: config.redirectUri,
    apiVersion: config.apiVersion,
    updatedAt: config.updatedAt,
  };
}

async function requiredGoogleAdsConfigValue(key: keyof GoogleAdsAppConfig, label: string) {
  const config = await getGoogleAdsAppConfig();
  const value = config[key];
  if (!value) throw new Error(`${label} is not configured`);
  return String(value);
}

export async function readConnections(): Promise<GoogleAdsConnection[]> {
  await ensureStore();
  const raw = await fs.readFile(STORE_PATH, "utf8");
  return JSON.parse(raw) as GoogleAdsConnection[];
}

async function writeConnections(connections: GoogleAdsConnection[]) {
  await ensureStore();
  await fs.writeFile(STORE_PATH, JSON.stringify(connections, null, 2), "utf8");
}

export function publicConnection(connection: GoogleAdsConnection): PublicGoogleAdsConnection {
  const {
    refresh_token,
    access_token,
    access_token_expires_at,
    ...safe
  } = connection;
  void refresh_token;
  void access_token;
  void access_token_expires_at;
  return safe;
}

export async function getConnection(id: string) {
  const connections = await readConnections();
  return connections.find((connection) => connection.id === id) ?? null;
}

export function normalizeUserId(value = "") {
  return value.trim().toLowerCase();
}

export function getRequestUserId(req: Request) {
  const url = new URL(req.url);
  return normalizeUserId(
    req.headers.get("x-trackfy-user-id") ||
    url.searchParams.get("user_id") ||
    ""
  );
}

export function connectionBelongsToUser(connection: GoogleAdsConnection, userId: string) {
  return normalizeUserId(connection.user_id) === normalizeUserId(userId);
}

export async function getUserConnections(userId: string) {
  const normalizedUserId = normalizeUserId(userId);
  const connections = await readConnections();
  return connections.filter((connection) => normalizeUserId(connection.user_id) === normalizedUserId);
}

export async function upsertConnection(input: {
  userId: string;
  customerId: string;
  loginCustomerId?: string;
  refreshToken: string;
  scope?: string;
}) {
  const now = new Date().toISOString();
  const userId = normalizeUserId(input.userId);
  const customerId = cleanCustomerId(input.customerId);
  const loginCustomerId = cleanCustomerId(input.loginCustomerId ?? "");
  const connections = await readConnections();
  const existing = connections.find((connection) =>
    normalizeUserId(connection.user_id) === userId && connection.customer_id === customerId
  );
  const next: GoogleAdsConnection = {
    id: existing?.id ?? crypto.randomUUID(),
    user_id: userId,
    customer_id: customerId,
    login_customer_id: loginCustomerId || undefined,
    refresh_token: encryptSecret(input.refreshToken),
    access_token: undefined,
    access_token_expires_at: undefined,
    scope: input.scope || SCOPE,
    status: "active",
    last_error: undefined,
    last_synced_at: existing?.last_synced_at,
    created_at: existing?.created_at ?? now,
    updated_at: now,
  };
  await writeConnections(existing
    ? connections.map((connection) => connection.id === existing.id ? next : connection)
    : [...connections, next]
  );
  return next;
}

export async function updateConnection(id: string, patch: Partial<GoogleAdsConnection>) {
  const connections = await readConnections();
  const next = connections.map((connection) =>
    connection.id === id ? { ...connection, ...patch, updated_at: new Date().toISOString() } : connection
  );
  await writeConnections(next);
  return next.find((connection) => connection.id === id) ?? null;
}

export function diagnoseGoogleAdsError(status: number, message = "") {
  if (status !== 403) return message || `Google Ads API HTTP ${status}`;
  return [
    "Google Ads API HTTP 403.",
    "Verifique se o e-mail autorizado no OAuth tem acesso à conta Google Ads.",
    "Verifique se o Customer ID está correto e sem hífens.",
    "Se usar MCC, verifique se o Login Customer ID é a MCC correta e sem hífens.",
    "Verifique se o Developer Token é válido.",
    "Verifique se a conta Google Ads está vinculada à MCC informada.",
  ].join(" ");
}

export function signOAuthState(payload: Record<string, string>) {
  const encoded = Buffer.from(JSON.stringify({ ...payload, ts: Date.now().toString() })).toString("base64url");
  const secret = process.env.GOOGLE_ADS_OAUTH_STATE_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET || "trackfy-dev-oauth-state";
  const sig = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyOAuthState(state: string) {
  const [encoded, sig] = state.split(".");
  const secret = process.env.GOOGLE_ADS_OAUTH_STATE_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET || "trackfy-dev-oauth-state";
  const expected = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig || ""), Buffer.from(expected))) {
    throw new Error("Invalid OAuth state");
  }
  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as Record<string, string>;
  if (Date.now() - Number(payload.ts ?? 0) > 15 * 60 * 1000) throw new Error("Expired OAuth state");
  return payload;
}

export async function googleOAuthUrl(input: { userId: string; customerId: string; loginCustomerId?: string; popup?: boolean }) {
  const clientId = await requiredGoogleAdsConfigValue("clientId", "GOOGLE_ADS_CLIENT_ID");
  const redirectUri = await requiredGoogleAdsConfigValue("redirectUri", "GOOGLE_ADS_REDIRECT_URI");
  const state = signOAuthState({
    userId: input.userId,
    customerId: cleanCustomerId(input.customerId),
    loginCustomerId: cleanCustomerId(input.loginCustomerId ?? ""),
    popup: input.popup ? "1" : "",
  });
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeCodeForTokens(code: string) {
  const params = new URLSearchParams({
    client_id: await requiredGoogleAdsConfigValue("clientId", "GOOGLE_ADS_CLIENT_ID"),
    client_secret: await requiredGoogleAdsConfigValue("clientSecret", "GOOGLE_ADS_CLIENT_SECRET"),
    redirect_uri: await requiredGoogleAdsConfigValue("redirectUri", "GOOGLE_ADS_REDIRECT_URI"),
    code,
    grant_type: "authorization_code",
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error_description || data?.error || "OAuth token exchange failed");
  return data as { refresh_token?: string; access_token?: string; expires_in?: number; scope?: string };
}

export async function getValidGoogleAdsAccessToken(connection: GoogleAdsConnection) {
  const expiresAt = connection.access_token_expires_at ? new Date(connection.access_token_expires_at).getTime() : 0;
  if (connection.access_token && expiresAt - Date.now() > 5 * 60 * 1000) {
    return decryptSecret(connection.access_token);
  }

  const params = new URLSearchParams({
    client_id: await requiredGoogleAdsConfigValue("clientId", "GOOGLE_ADS_CLIENT_ID"),
    client_secret: await requiredGoogleAdsConfigValue("clientSecret", "GOOGLE_ADS_CLIENT_SECRET"),
    refresh_token: decryptSecret(connection.refresh_token),
    grant_type: "refresh_token",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.error === "invalid_grant"
      ? "Reconecte sua conta Google Ads."
      : data?.error_description || data?.error || "Could not refresh Google Ads access token";
    await updateConnection(connection.id, {
      status: data?.error === "invalid_grant" ? "needs_reauth" : "error",
      last_error: message,
    });
    throw new Error(message);
  }

  const accessToken = data.access_token as string;
  await updateConnection(connection.id, {
    access_token: encryptSecret(accessToken),
    access_token_expires_at: new Date(Date.now() + Number(data.expires_in ?? 3600) * 1000).toISOString(),
    status: "active",
    last_error: undefined,
  });
  return accessToken;
}

export async function googleAdsHeaders(connection: GoogleAdsConnection, accessToken: string) {
  const developerToken = await requiredGoogleAdsConfigValue("developerToken", "GOOGLE_ADS_DEVELOPER_TOKEN");
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "developer-token": developerToken,
    "Content-Type": "application/json",
  };
  if (connection.login_customer_id) headers["login-customer-id"] = cleanCustomerId(connection.login_customer_id);
  return headers;
}

export async function googleAdsSearch(connection: GoogleAdsConnection, query: string, retry = true) {
  const accessToken = await getValidGoogleAdsAccessToken(connection);
  const config = await getGoogleAdsAppConfig();
  const res = await fetch(`https://googleads.googleapis.com/${config.apiVersion}/customers/${cleanCustomerId(connection.customer_id)}/googleAds:searchStream`, {
    method: "POST",
    headers: await googleAdsHeaders(connection, accessToken),
    body: JSON.stringify({ query }),
    signal: AbortSignal.timeout(25000),
  });
  const data = await res.json().catch(() => ({}));
  if ((res.status === 401 || res.status === 403) && retry) {
    await updateConnection(connection.id, { access_token: undefined, access_token_expires_at: undefined });
    return googleAdsSearch({ ...connection, access_token: undefined, access_token_expires_at: undefined }, query, false);
  }
  if (!res.ok) {
    const error = diagnoseGoogleAdsError(res.status, data?.error?.message);
    await updateConnection(connection.id, { status: "error", last_error: error });
    throw new Error(error);
  }
  await updateConnection(connection.id, { status: "active", last_error: undefined, last_synced_at: new Date().toISOString() });
  return Array.isArray(data) ? data.flatMap((chunk) => chunk.results ?? []) : data.results ?? [];
}

export async function listAccessibleCustomers(connection: GoogleAdsConnection) {
  const accessToken = await getValidGoogleAdsAccessToken(connection);
  const config = await getGoogleAdsAppConfig();
  const res = await fetch(`https://googleads.googleapis.com/${config.apiVersion}/customers:listAccessibleCustomers`, {
    headers: await googleAdsHeaders(connection, accessToken),
    signal: AbortSignal.timeout(25000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(diagnoseGoogleAdsError(res.status, data?.error?.message));
  return data.resourceNames ?? [];
}
