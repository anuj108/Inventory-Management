import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../lib/api";

export function AppLayout() {
  const navigate = useNavigate();
  const isAuthed = Boolean(localStorage.getItem("auth_token"));
	return (
		<Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <AppBar position="static" elevation={0}>
                <Toolbar sx={{ flexDirection: "column", py: { xs: 1, md: 2 }, px: { xs: 1, md: 3 } }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 700, fontSize: { xs: "1.1rem", md: "1.25rem" }, mb: { xs: 1, md: 1.5 } }}>
                        Sandeep Agri Store • संदीप एग्री स्टोर
                    </Typography>
                    {isAuthed && (
                      <Box sx={{ display: "flex", gap: { xs: 1, md: 2 }, flexWrap: "wrap", justifyContent: "center" }}>
                        <Button size="small" color="inherit" component={Link} to="/" sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" }, minWidth: "auto", px: { xs: 1, md: 2 } }}>Inventory • इन्वेंटरी</Button>
                        <Button size="small" color="inherit" component={Link} to="/sales" sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" }, minWidth: "auto", px: { xs: 1, md: 2 } }}>Sales • बिक्री</Button>
                        <Button size="small" color="inherit" component={Link} to="/search" sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" }, minWidth: "auto", px: { xs: 1, md: 2 } }}>Search • खोज</Button>
                        <Button size="small" color="inherit" onClick={() => { logout(); navigate("/login"); }} sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" }, minWidth: "auto", px: { xs: 1, md: 2 } }}>Logout • लॉगआउट</Button>
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
