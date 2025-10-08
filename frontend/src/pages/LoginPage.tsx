import { useState } from "react";
import { Box, Button, Paper, Stack, TextField, Typography, Alert } from "@mui/material";
import { login } from "../lib/api";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			await login(email, password);
			navigate("/");
		} catch (err: any) {
			setError(err?.message || "Login failed");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
			<Paper sx={{ p: 4, width: 360 }} elevation={3}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                    Sign in • साइन इन
                </Typography>
				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}
				<Stack component="form" onSubmit={onSubmit} spacing={2}>
                    <TextField label="Email • ईमेल" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <TextField label="Password • पासवर्ड" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in • साइन इन"}
					</Button>
				</Stack>
			</Paper>
		</Box>
	);
}


