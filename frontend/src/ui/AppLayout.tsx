import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../lib/api";

export function AppLayout() {
  const navigate = useNavigate();
  const isAuthed = Boolean(localStorage.getItem("auth_token"));
	return (
		<Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
			<AppBar position="static">
				<Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
						Sandeep Agri Store
					</Typography>
            {isAuthed && (
              <>
                <Button color="inherit" component={Link} to="/">Inventory</Button>
                <Button color="inherit" component={Link} to="/sales">Sales</Button>
                <Button color="inherit" component={Link} to="/search">Search</Button>
                <Button color="inherit" onClick={() => { logout(); navigate("/login"); }}>Logout</Button>
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
