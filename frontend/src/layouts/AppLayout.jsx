import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Drawer, AppBar, Toolbar, Typography, List, ListItemButton,
    ListItemIcon, ListItemText, Button,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 220;

const NAV_ITEMS = {
    employee: [
        { label: 'Dashboard', path: '/employee/dashboard', icon: <DashboardIcon /> },
        { label: 'Create Voucher', path: '/employee/create-voucher', icon: <AddCircleIcon /> },
        { label: 'My Vouchers', path: '/employee/my-vouchers', icon: <ListAltIcon /> },
    ],
    director: [
        { label: 'Dashboard', path: '/director/dashboard', icon: <DashboardIcon /> },
        { label: 'Pending Approvals', path: '/director/pending-approvals', icon: <PendingActionsIcon /> },
        { label: 'All Vouchers', path: '/director/all-vouchers', icon: <ListAltIcon /> },
    ],
    accounts: [
        { label: 'Dashboard', path: '/accounts/dashboard', icon: <DashboardIcon /> },
        { label: 'All Vouchers', path: '/accounts/all-vouchers', icon: <ListAltIcon /> },
    ],
};

export default function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const items = NAV_ITEMS[user?.role] || [];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="h6">Expense Voucher System</Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="body2">{user?.name} ({user?.role})</Typography>
                        <Button color="inherit" onClick={handleLogout}>Logout</Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <List>
                    {items.map((item) => (
                        <ListItemButton
                            key={item.path}
                            selected={location.pathname === item.path}
                            onClick={() => navigate(item.path)}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    ))}
                </List>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                <Outlet />
            </Box>
        </Box>
    );
}