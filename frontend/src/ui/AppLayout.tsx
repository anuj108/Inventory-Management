import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../lib/api";

export function AppLayout() {
  const navigate = useNavigate();
  const isAuthed = Boolean(localStorage.getItem("auth_token"));
	return (
		<Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <AppBar position="static" elevation={0}>
                <Toolbar sx={{ minHeight: { xs: 64, md: 64 }, px: { xs: 1, md: 3 } }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, fontSize: { xs: "1rem", md: "1.25rem" } }}>
                        Sandeep Agri Store • संदीप एग्री स्टोर
                    </Typography>
                    {isAuthed && (
                      <Box sx={{ display: "flex", gap: { xs: 0.5, md: 1 }, flexWrap: "nowrap", overflow: "hidden" }}>
                        <Button size="small" color="inherit" component={Link} to="/" sx={{ fontSize: { xs: "0.7rem", md: "0.875rem" }, minWidth: "auto", px: { xs: 0.5, md: 1 } }}>Inventory</Button>
                        <Button size="small" color="inherit" component={Link} to="/sales" sx={{ fontSize: { xs: "0.7rem", md: "0.875rem" }, minWidth: "auto", px: { xs: 0.5, md: 1 } }}>Sales</Button>
                        <Button size="small" color="inherit" component={Link} to="/search" sx={{ fontSize: { xs: "0.7rem", md: "0.875rem" }, minWidth: "auto", px: { xs: 0.5, md: 1 } }}>Search</Button>
                        <Button size="small" color="inherit" onClick={() => { logout(); navigate("/login"); }} sx={{ fontSize: { xs: "0.7rem", md: "0.875rem" }, minWidth: "auto", px: { xs: 0.5, md: 1 } }}>Logout</Button>
                      </Box>
                    )}
                </Toolbar>
            </AppBar>
            <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 }, px: { xs: 2, md: 3 }, flexGrow: 1 }}>
				<Outlet />
			</Container>
		</Box>
	);
}
