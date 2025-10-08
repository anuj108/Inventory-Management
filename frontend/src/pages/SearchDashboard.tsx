import * as React from "react";
import { Alert, Box, Card, CardContent, Grid, Stack, Tab, Tabs, TextField, Typography, Chip } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

type CustomerWithTotals = {
	_id: string;
	name: string;
	phone?: string;
	address?: string;
	totals?: { sold: number; paid: number; due: number };
};

export function SearchDashboard() {
	const [tab, setTab] = React.useState<0 | 1>(0);
	const [qCustomer, setQCustomer] = React.useState("");
	const [qProduct, setQProduct] = React.useState("");

	const customers = useQuery({
		queryKey: ["customer-search", qCustomer],
		queryFn: () => api<{ items: CustomerWithTotals[] }>(`/customers/search?q=${encodeURIComponent(qCustomer)}&withBalances=1`)
	});

	const products = useQuery({
		queryKey: ["product-search", qProduct],
		queryFn: () => api<{ items: any[]; total: number; page: number; limit: number }>(`/products?q=${encodeURIComponent(qProduct)}&limit=50`)
	});

	return (
		<Stack spacing={2}>
			<Typography variant="h6">Search Dashboard</Typography>
			<Tabs value={tab} onChange={(_, v) => setTab(v)}>
				<Tab label="Search Customer" />
				<Tab label="Search Inventory" />
			</Tabs>

			{tab === 0 && (
				<Box>
					<TextField label="Search by name or phone" value={qCustomer} onChange={(e) => setQCustomer(e.target.value)} fullWidth sx={{ mb: 2 }} />
					{customers.error && <Alert severity="error">{String(customers.error)}</Alert>}
					<Grid container spacing={2}>
						{customers.data?.items.map((c) => (
							<Grid item xs={12} md={6} key={c._id}>
								<Card>
									<CardContent>
										<Typography variant="subtitle1">{c.name}</Typography>
										<Typography variant="body2" color="text.secondary">{c.phone || ""}</Typography>
										<Typography variant="body2" color="text.secondary">{c.address || ""}</Typography>
										<Box sx={{ mt: 1 }}>
											<Chip size="small" label={`Opening: ₹ ${(c as any).openingBalance ?? 0}`} sx={{ mr: 1 }} />
											<Chip size="small" label={`Current: ₹ ${(c as any).currentBalance ?? 0}`} />
										</Box>
										<Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
											<Typography variant="body2">Sold: ₹ {(c.totals?.sold ?? 0).toFixed(2)}</Typography>
											<Typography variant="body2">Paid: ₹ {(c.totals?.paid ?? 0).toFixed(2)}</Typography>
											<Typography variant="body2" color={(c.totals?.due ?? 0) > 0 ? "error" : "success.main"}>Due: ₹ {(c.totals?.due ?? 0).toFixed(2)}</Typography>
										</Box>
										<Typography variant="caption" color="text.secondary">ID: {c._id}</Typography>
									</CardContent>
								</Card>
							</Grid>
						))}
					</Grid>
				</Box>
			)}

			{tab === 1 && (
				<Box>
					<TextField label="Search by name or category" value={qProduct} onChange={(e) => setQProduct(e.target.value)} fullWidth sx={{ mb: 2 }} />
					{products.error && <Alert severity="error">{String(products.error)}</Alert>}
					<Grid container spacing={2}>
						{products.data?.items.map((p: any) => (
							<Grid item xs={12} md={6} key={p._id}>
								<Card>
									<CardContent>
										<Stack direction="row" justifyContent="space-between" alignItems="center">
											<Typography variant="subtitle1">{p.name}</Typography>
											<Box>
												<Chip size="small" label={p.category} sx={{ mr: 1 }} />
												{p.unit && p.unit !== "qty" && <Chip size="small" label={p.unit} />}
											</Box>
										</Stack>
										<Grid container spacing={1} sx={{ mt: 1 }}>
											<Grid item xs={6}><Typography variant="body2" color="text.secondary">Brand</Typography><Typography variant="body1">{p.brand || "-"}</Typography></Grid>
											<Grid item xs={6}><Typography variant="body2" color="text.secondary">Barcode</Typography><Typography variant="body1">{p.barcode || "-"}</Typography></Grid>
											<Grid item xs={6}><Typography variant="body2" color="text.secondary">Purchase</Typography><Typography variant="body1">₹ {Number(p.purchasePrice || 0).toFixed(2)}</Typography></Grid>
											<Grid item xs={6}><Typography variant="body2" color="text.secondary">Selling</Typography><Typography variant="body1">₹ {Number(p.sellingPrice || 0).toFixed(2)}{p.unit === "kg" ? "/kg" : ""}</Typography></Grid>
											<Grid item xs={6}><Typography variant="body2" color="text.secondary">Stock</Typography><Typography variant="body1">{p.stockQuantity}{p.unit && p.unit !== "qty" ? ` ${p.unit}` : ""}</Typography></Grid>
											<Grid item xs={6}><Typography variant="body2" color="text.secondary">Low stock at</Typography><Typography variant="body1">{p.lowStockThreshold ?? 0}</Typography></Grid>
										</Grid>
										<Typography variant="caption" color="text.secondary">ID: {p._id}</Typography>
									</CardContent>
								</Card>
							</Grid>
						))}
					</Grid>
				</Box>
			)}
		</Stack>
	);
}


