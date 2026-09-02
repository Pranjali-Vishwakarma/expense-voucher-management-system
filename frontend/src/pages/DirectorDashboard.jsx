import { Box, Typography, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DirectorDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate('/login');

        useEffect(() => {
            const loadStats = async () => {
                const res = await api.get('/vouchers');
                const all = res.data.vouchers;
                setPendingCount(all.filter(v => v.status === 'submitted').length);
            };
            loadStats();
        }, []);
    };

    return (
        <Box p={4}>
            <Typography variant="h4" mb={2}>Welcome, {user?.name}</Typography>
            <Typography color="text.secondary" mb={3}>Role: {user?.role}</Typography>
            <Button variant="outlined" onClick={handleLogout}>Logout</Button>
        </Box>
    );
}