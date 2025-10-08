import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Box, Button, Card, CardActions, CardContent, Chip, Grid, Stack, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Autocomplete, IconButton, Select, MenuItem } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";

type Product = {
	_id: string;
	name: string;
	category: string;
	brand?: string;
	unit: string;
	purchasePrice: number;
	sellingPrice: number;
	stockQuantity: number;
	lowStockThreshold?: number;
	barcode?: string;
	isActive: boolean;
};

type Paginated<T> = { items: T[]; page: number; limit: number; total: number };

export function InventoryPage() {
	const qc = useQueryClient();
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["products"],
		queryFn: () => api<Paginated<Product>>("/products")
	});

	const [tab, setTab] = useState<0 | 1>(0); // 0 => by kg, 1 => normal
	const [formKg, setFormKg] = useState({
		name: "",
		category: "",
		pricePerKg: 0,
		quantityKg: 0
	});
	const [formQty, setFormQty] = useState({
		name: "",
		category: "",
		pricePerQty: 0,
		quantity: 0
	});

const createMutation = useMutation({
    mutationFn: (payload: any) => api<Product>("/products", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: async () => {
        await qc.invalidateQueries({ queryKey: ["products"] });
        await qc.refetchQueries({ queryKey: ["products"] });
    }
});

	const [editing, setEditing] = useState<null | Product>(null);
	const [editForm, setEditForm] = useState<any | null>(null);

const updateMutation = useMutation({
    mutationFn: (payload: any) => api<Product>(`/products/${editing?._id}`, { method: "PUT", body: JSON.stringify(payload) }),
    onSuccess: async () => {
        await qc.invalidateQueries({ queryKey: ["products"] });
        await qc.refetchQueries({ queryKey: ["products"] });
        setEditing(null);
        setEditForm(null);
    }
});

	const [deleting, setDeleting] = useState<null | Product>(null);
const deleteMutation = useMutation({
    mutationFn: async () => {
        if (!deleting) return;
        await api<void>(`/products/${deleting._id}`, { method: "DELETE" });
    },
    onSuccess: async () => {
        await qc.invalidateQueries({ queryKey: ["products"] });
        await qc.refetchQueries({ queryKey: ["products"] });
        setDeleting(null);
    }
});

	return (
		<Stack spacing={3}>
			<Typography variant="h5">Inventory</Typography>
			<Card>
				<CardContent>
					<Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
						<Tab label="Add product (kg)" />
						<Tab label="Add product (normal)" />
					</Tabs>
					{tab === 0 && (
						<Stack direction={{ xs: "column", md: "row" }} spacing={2} component="form" onSubmit={(e) => {
							e.preventDefault();
							createMutation.mutate({
								name: formKg.name,
								category: formKg.category,
								unit: "kg",
								purchasePrice: 0,
								sellingPrice: formKg.pricePerKg,
								stockQuantity: formKg.quantityKg
							});
						}}>
							<TextField size="small" label="Product name" value={formKg.name} onChange={(e) => setFormKg({ ...formKg, name: e.target.value })} required />
							<Autocomplete
								freeSolo
								options={[...new Set((data?.items || []).map((p) => p.category))]}
								value={formKg.category}
								onInputChange={(_, v) => setFormKg({ ...formKg, category: v })}
								blurOnSelect
								sx={{ minWidth: 240, flex: 1 }}
								renderInput={(params) => <TextField {...params} size="small" fullWidth label="Category" required />}
							/>
							<TextField size="small" type="number" label="Unit (kg)" value={formKg.quantityKg} onChange={(e) => setFormKg({ ...formKg, quantityKg: Number(e.target.value) })} required />
							<TextField size="small" type="number" label="Price per kg" value={formKg.pricePerKg} onChange={(e) => setFormKg({ ...formKg, pricePerKg: Number(e.target.value) })} required />
							<Button type="submit" variant="contained">Add</Button>
						</Stack>
					)}
					{tab === 1 && (
						<Stack direction={{ xs: "column", md: "row" }} spacing={2} component="form" onSubmit={(e) => {
							e.preventDefault();
							createMutation.mutate({
								name: formQty.name,
								category: formQty.category,
								unit: "qty",
								purchasePrice: 0,
								sellingPrice: formQty.pricePerQty,
								stockQuantity: formQty.quantity
							});
						}}>
							<TextField size="small" label="Product name" value={formQty.name} onChange={(e) => setFormQty({ ...formQty, name: e.target.value })} required />
							<Autocomplete
								freeSolo
								options={[...new Set((data?.items || []).map((p) => p.category))]}
								value={formQty.category}
								onInputChange={(_, v) => setFormQty({ ...formQty, category: v })}
								blurOnSelect
								sx={{ minWidth: 240, flex: 1 }}
								renderInput={(params) => <TextField {...params} size="small" fullWidth label="Category" required />}
							/>
							<TextField size="small" type="number" label="Quantity" value={formQty.quantity} onChange={(e) => setFormQty({ ...formQty, quantity: Number(e.target.value) })} required />
							<TextField size="small" type="number" label="Price per quantity" value={formQty.pricePerQty} onChange={(e) => setFormQty({ ...formQty, pricePerQty: Number(e.target.value) })} required />
							<Button type="submit" variant="contained">Add</Button>
						</Stack>
					)}
				</CardContent>
			</Card>

			{isLoading && <Typography>Loading...</Typography>}
			{isError && <Typography color="error">{(error as any)?.message || "Error"}</Typography>}

			<Grid container spacing={2}>
				{data?.items?.map((p) => (
					<Grid item xs={12} md={6} lg={4} key={p._id}>
						<Card elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
							<CardContent sx={{ pb: 1.5 }}>
								<Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
									<Typography variant="h6" noWrap>{p.name}</Typography>
									<Stack direction="row" spacing={1}>
										<Chip size="small" label={p.category} />
										{p.unit && p.unit !== "qty" && <Chip size="small" label={p.unit} />}
									</Stack>
								</Stack>

								<Typography variant="body2" sx={{ mt: 0.5 }} color="text.secondary">
									Stock: {p.stockQuantity}{p.unit && p.unit !== "qty" ? ` ${p.unit}` : ""}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Price: ₹{p.sellingPrice}{p.unit === "kg" ? "/kg" : ""}
								</Typography>
							</CardContent>
							<CardActions sx={{ pt: 0.5 }}>
                            <IconButton size="small" color="primary" onClick={() => { setEditing(p); setEditForm({
                                name: p.name,
                                category: p.category,
                                unit: p.unit,
                                sellingPrice: p.sellingPrice,
                                stockQuantity: p.stockQuantity
                            }); }} aria-label="edit">
									<EditIcon fontSize="small" />
								</IconButton>
								<IconButton size="small" color="error" onClick={() => setDeleting(p)} aria-label="delete">
									<DeleteIcon fontSize="small" />
								</IconButton>
							</CardActions>
						</Card>
					</Grid>
				))}
			</Grid>

			<Dialog open={Boolean(deleting)} onClose={() => setDeleting(null)}>
				<DialogTitle>Delete product</DialogTitle>
				<DialogContent>
					<Typography>Are you sure you want to delete "{deleting?.name}"? This action cannot be undone.</Typography>
				</DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleting(null)}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={async () => {
                        await deleteMutation.mutateAsync();
                        setDeleting(null);
                    }} disabled={!deleting}>Delete</Button>
                </DialogActions>
			</Dialog>

            <Dialog open={Boolean(editing)} onClose={() => { setEditing(null); setEditForm(null); }} fullWidth maxWidth="sm">
				<DialogTitle>Edit Product</DialogTitle>
				<DialogContent>
					{editForm && (
						<Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField size="small" label="Product name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                            <TextField size="small" label="Category" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} required />
                            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                <Select size="small" value={editForm.unit} onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })} sx={{ minWidth: 120 }}>
                                    <MenuItem value="kg">kg</MenuItem>
                                    <MenuItem value="qty">qty</MenuItem>
                                </Select>
                                <TextField size="small" type="number" label={editForm.unit === "kg" ? "Quantity (kg)" : "Quantity"} value={editForm.stockQuantity} onChange={(e) => setEditForm({ ...editForm, stockQuantity: Number(e.target.value) })} required />
                            </Box>
                            <TextField size="small" type="number" label={editForm.unit === "kg" ? "Price per kg" : "Price per quantity"} value={editForm.sellingPrice} onChange={(e) => setEditForm({ ...editForm, sellingPrice: Number(e.target.value) })} required />
						</Stack>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => { setEditing(null); setEditForm(null); }}>Cancel</Button>
                    <Button variant="contained" onClick={() => updateMutation.mutate(editForm)} disabled={!editForm}>Save</Button>
				</DialogActions>
			</Dialog>
		</Stack>
	);
}
