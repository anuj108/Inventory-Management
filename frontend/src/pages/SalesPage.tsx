import * as React from "react";
import { Alert, Autocomplete, Box, Button, Card, CardContent, Grid, Stack, TextField, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

type SalesSummary = {
	items: { product: string; quantitySold: number; revenue: number }[];
	totals: { totalRevenue: number; totalPaid: number };
};

export function SalesPage() {
    // Removed summary/date range UI per request

    // inventory for product suggestions
    const products = useQuery({ queryKey: ["products"], queryFn: () => api<{ items: any[] }>(`/products`) });
    const qc = useQueryClient();
    const recentSales = useQuery({ queryKey: ["recent-sales"], queryFn: () => api<{ items: any[] }>(`/sales/recent?limit=20`) });

    const [saleForm, setSaleForm] = React.useState({
        customerName: "",
        customerPhone: "",
        productId: "",
        quantity: 1,
        sellingPrice: 0,
        paid: 0
    });
    const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

    function validateForm() {
        const errors: Record<string, string> = {};
        if (!saleForm.customerName.trim()) errors.customerName = "Customer name is required";
        if (!saleForm.productId) errors.productId = "Product is required";
        if (!(saleForm.quantity > 0)) errors.quantity = "Quantity must be greater than 0";
        if (!(saleForm.sellingPrice >= 0)) errors.sellingPrice = "Price cannot be negative";
        if (!(saleForm.paid >= 0)) errors.paid = "Paid cannot be negative";
        const total = saleForm.quantity * saleForm.sellingPrice;
        if (saleForm.paid > total) errors.paid = "Paid cannot exceed total";
        return errors;
    }
    const createSale = useMutation({
        mutationFn: (payload: any) => api(`/sales`, { method: "POST", body: JSON.stringify(payload) }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["recent-sales"] });
            qc.invalidateQueries({ queryKey: ["products"] });
            setSaleForm({ customerName: "", customerPhone: "", productId: "", quantity: 1, sellingPrice: 0, paid: 0 });
            setFormErrors({});
        }
    });

    return (
        <>
        <Stack spacing={2}></Stack>

        <Stack spacing={2} sx={{ mt: 3 }}>
            <Typography variant="subtitle1">Create Sale</Typography>
            <Card>
                <CardContent>
                    {createSale.isError && (
                        <Alert severity="error" sx={{ mb: 2 }}>{String((createSale.error as any)?.message || "Failed to create sale")}</Alert>
                    )}
                    <Stack spacing={2} component="form" onSubmit={(e) => {
                        e.preventDefault();
                        const errors = validateForm();
                        setFormErrors(errors);
                        if (Object.keys(errors).length > 0) return;
                        createSale.mutate(saleForm);
                    }}>
                        <TextField label="Customer name" value={saleForm.customerName} onChange={(e) => { setSaleForm({ ...saleForm, customerName: e.target.value }); if (formErrors.customerName) setFormErrors({ ...formErrors, customerName: "" }); }} required fullWidth error={Boolean(formErrors.customerName)} helperText={formErrors.customerName} />
                        <TextField label="Mobile" value={saleForm.customerPhone} onChange={(e) => setSaleForm({ ...saleForm, customerPhone: e.target.value })} fullWidth />
                        <Autocomplete
                            options={(products.data?.items || []).map((p: any) => ({ label: `${p.name} (${p.unit})`, id: p._id, unit: p.unit, price: p.sellingPrice }))}
                            value={(products.data?.items || []).map((p: any) => ({ label: `${p.name} (${p.unit})`, id: p._id, unit: p.unit, price: p.sellingPrice })).find((o: any) => o.id === saleForm.productId) || null}
                            onChange={(_, val: any) => { setSaleForm({ ...saleForm, productId: val?.id || "", sellingPrice: val?.price || saleForm.sellingPrice }); if (formErrors.productId) setFormErrors({ ...formErrors, productId: "" }); }}
                            renderInput={(params) => <TextField {...params} label="Product" required fullWidth error={Boolean(formErrors.productId)} helperText={formErrors.productId} />}
                        />
                        <TextField
                            label={`${(products.data?.items || []).find((p: any) => p._id === saleForm.productId)?.unit === "kg" ? "Quantity (kg)" : "Quantity"}`}
                            type="number"
                            value={saleForm.quantity}
                            onChange={(e) => { setSaleForm({ ...saleForm, quantity: Number(e.target.value) }); if (formErrors.quantity) setFormErrors({ ...formErrors, quantity: "" }); }}
                            required fullWidth error={Boolean(formErrors.quantity)} helperText={formErrors.quantity} />
                        <TextField label="Selling price" type="number" value={saleForm.sellingPrice} onChange={(e) => { setSaleForm({ ...saleForm, sellingPrice: Number(e.target.value) }); if (formErrors.sellingPrice) setFormErrors({ ...formErrors, sellingPrice: "" }); }} required fullWidth error={Boolean(formErrors.sellingPrice)} helperText={formErrors.sellingPrice} />
                        <TextField label="Paid" type="number" value={saleForm.paid} onChange={(e) => { setSaleForm({ ...saleForm, paid: Number(e.target.value) }); if (formErrors.paid) setFormErrors({ ...formErrors, paid: "" }); }} fullWidth error={Boolean(formErrors.paid)} helperText={formErrors.paid} />
                        <TextField label="Left" type="number" value={Math.max(0, (saleForm.quantity * saleForm.sellingPrice) - saleForm.paid)} disabled fullWidth />
                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button type="submit" variant="contained" disabled={createSale.isPending}>Save</Button>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </Stack>

        <Stack spacing={2} sx={{ mt: 4 }}>
            <Typography variant="subtitle1">Recent Sales</Typography>
            <Grid container spacing={2}>
                {(recentSales.data?.items || []).map((s: any) => {
                    const item = s.items?.[0];
                    const due = Math.max(0, (s.total || 0) - (s.paid || 0));
                    return (
                        <Grid item xs={12} md={6} key={s._id}>
                            <Card elevation={2} sx={{ borderRadius: 2 }}>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="subtitle1" noWrap>
                                            {item?.nameSnapshot || "Sale"}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {dayjs(s.createdAt).format("DD MMM YYYY, HH:mm")}
                                        </Typography>
                                    </Stack>
                                    <Grid container spacing={1} sx={{ mt: 1 }}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Quantity</Typography>
                                            <Typography variant="body1">{item?.quantity}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Total</Typography>
                                            <Typography variant="body1">₹ {Number(s.total || 0).toFixed(2)}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Paid</Typography>
                                            <Typography variant="body1">₹ {Number(s.paid || 0).toFixed(2)}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Due</Typography>
                                            <Typography variant="body1" color={due > 0 ? "error" : "success.main"}>₹ {due.toFixed(2)}</Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Stack>
        </>
    );
}


