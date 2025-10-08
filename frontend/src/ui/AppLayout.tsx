import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../lib/api";

export function AppLayout() {
  const navigate = useNavigate();
  const isAuthed = Boolean(localStorage.getItem("auth_token"));
	return (
		<Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <AppBar position="static" elevation={0}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
                        Sandeep Agri Store • संदीप एग्री स्टोर
                    </Typography>
                    {isAuthed && (
                      <>
                        <Button color="inherit" component={Link} to="/">Inventory • इन्वेंटरी</Button>
                        <Button color="inherit" component={Link} to="/sales">Sales • बिक्री</Button>
                        <Button color="inherit" component={Link} to="/search">Search • खोज</Button>
                        <Button color="inherit" onClick={() => { logout(); navigate("/login"); }}>Logout • लॉगआउट</Button>
                      </>
                    )}
                </Toolbar>
            </AppBar>
			<Container sx={{ py: 3, flexGrow: 1 }}>
				<Outlet />
			</Container>
		</Box>
	);
}
