import { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await api.get('/vouchers/stats');
                setStats(res.data.stats);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load stats');
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight={600}>Welcome, {user?.name}</Typography>
                    <Typography color="text.secondary" textTransform="capitalize">Role: {user?.role}</Typography>
                </Box>
                <Button variant="outlined" onClick={handleLogout}>Logout</Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard title="Total Vouchers" value={stats.total_vouchers} icon={<ReceiptIcon />} color="text.primary" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard title="Pending Review" value={stats.pending_count} icon={<PendingActionsIcon />} color="warning.main" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard title="Approved" value={stats.approved_count} icon={<CheckCircleIcon />} color="success.main" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard title="Rejected" value={stats.rejected_count} icon={<CancelIcon />} color="error.main" />
                </Grid>

                {/* Financial Totals */}
                <Grid item xs={12} sm={6}>
                    <StatsCard title="Total Approved Amount" value={`₹${stats.total_approved_amount.toLocaleString('en-IN')}`} color="success.dark" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <StatsCard title="Total Pending Amount" value={`₹${stats.total_pending_amount.toLocaleString('en-IN')}`} color="warning.dark" />
                </Grid>
            </Grid>
        </Box>
    );
}
