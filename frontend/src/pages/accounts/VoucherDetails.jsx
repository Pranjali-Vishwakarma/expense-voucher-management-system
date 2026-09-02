import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Paper, Typography, Grid, Chip, Divider, Box, CircularProgress, Alert, Button,
} from '@mui/material';
import api from '../../services/api';

const statusColor = { draft: 'default', submitted: 'warning', approved: 'success', rejected: 'error' };

function Field({ label, value }) {
    return (
        <Box mb={1.5}>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
            <Typography variant="body1">{value ?? '—'}</Typography>
        </Box>
    );
}

export default function VoucherDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [voucher, setVoucher] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get(`/vouchers/${id}`);
                setVoucher(res.data.voucher);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load voucher');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!voucher) return null;

    return (
        <Paper sx={{ p: 4, maxWidth: 700 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">{voucher.voucher_number}</Typography>
                <Chip label={voucher.status} color={statusColor[voucher.status]} />
            </Box>

            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle1" fontWeight={600} mb={1}>Basic Information</Typography>
            <Grid container spacing={2}>
                <Grid item xs={6}><Field label="Employee" value={voucher.employee_name} /></Grid>
                <Grid item xs={6}><Field label="Department" value={voucher.department_name} /></Grid>
                <Grid item xs={6}><Field label="Voucher Date" value={voucher.voucher_date?.slice(0, 10)} /></Grid>
                <Grid item xs={6}><Field label="Expense Date" value={voucher.expense_date?.slice(0, 10)} /></Grid>
                <Grid item xs={6}><Field label="Category" value={voucher.expense_category} /></Grid>
                <Grid item xs={6}><Field label="Amount" value={`₹${voucher.amount}`} /></Grid>
                <Grid item xs={12}><Field label="Expense Title" value={voucher.expense_title} /></Grid>
                <Grid item xs={12}><Field label="Description" value={voucher.expense_description} /></Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight={600} mb={1}>Employee Signature</Typography>
            {voucher.employee_signature_url ? (
                <img src={voucher.employee_signature_url} alt="Employee signature" style={{ maxHeight: 60 }} />
            ) : (
                <Typography variant="body2" color="text.secondary">Not uploaded</Typography>
            )}

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight={600} mb={1}>Approval Information</Typography>
            <Grid container spacing={2}>
                <Grid item xs={6}><Field label="Approval Date" value={voucher.approval_date?.slice(0, 10)} /></Grid>
                {voucher.status === 'approved' && (
                    <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">Director Signature</Typography>
                        <Box mt={0.5}>
                            {voucher.director_signature_url && (
                                <img src={voucher.director_signature_url} alt="Director signature" style={{ maxHeight: 60 }} />
                            )}
                        </Box>
                    </Grid>
                )}
                {voucher.status === 'rejected' && (
                    <Grid item xs={12}><Field label="Rejection Reason" value={voucher.rejection_reason} /></Grid>
                )}
            </Grid>

            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary">
                Created: {voucher.created_at?.slice(0, 10)} · Last Updated: {voucher.updated_at?.slice(0, 10)}
            </Typography>

            <Box mt={3}>
                <Button variant="outlined" onClick={() => navigate('/accounts/all-vouchers')}>Back to All Vouchers</Button>
            </Box>
        </Paper>
    );
}