// Resolve API base in this order: manual override in localStorage, Vite env, same-origin in production, '' in local dev
function resolveApiBase(): string {
    const override = typeof window !== "undefined" ? localStorage.getItem("api_base") : null;
    if (override) return override.replace(/\/$/, "");
    const envBase = (import.meta as any).env?.VITE_API_BASE;
    if (envBase) return String(envBase).replace(/\/$/, "");
    if (typeof window !== "undefined" && window.location && !/localhost|127\.0\.0\.1/.test(window.location.hostname)) {
        return window.location.origin.replace(/\/$/, "");
    }
    return ""; // dev proxy
}
const API_BASE = resolveApiBase();

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
	const token = localStorage.getItem("auth_token");
	const headers = new Headers(init?.headers || {});
	headers.set("Content-Type", "application/json");
	if (token) headers.set("Authorization", `Bearer ${token}`);
	const url = `${API_BASE}/api${path}`;
	const res = await fetch(url, { ...init, headers });
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || res.statusText);
	}
	// Handle empty/204 responses safely
	if (res.status === 204) return undefined as unknown as T;
	const contentType = res.headers.get("content-type") || "";
	if (!contentType.includes("application/json")) return undefined as unknown as T;
	const text = await res.text();
	if (!text) return undefined as unknown as T;
	return JSON.parse(text) as T;
}

export async function login(email: string, password: string) {
	const res = await fetch(`/api/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password })
	});
	if (!res.ok) throw new Error(await res.text());
	const data = await res.json();
	localStorage.setItem("auth_token", data.token);
	localStorage.setItem("auth_user", JSON.stringify(data.user));
	return data.user as { id: string; email: string; name: string; role: string };
}

export function logout() {
	localStorage.removeItem("auth_token");
	localStorage.removeItem("auth_user");
}
