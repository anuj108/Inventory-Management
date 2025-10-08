const API_BASE = (import.meta as any).env?.VITE_API_BASE || "";

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
