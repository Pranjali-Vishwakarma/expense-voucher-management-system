import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Paper, Table, TableHead, TableRow, TableCell, TableBody,
    Chip, IconButton, Typography, Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../services/api';

const statusColor = { draft: 'default', submitted: 'warning', approved: 'success', rejected: 'error' };

export default function MyVouchers() {
    const [vouchers, setVouchers] = useState([]);
    const navigate = useNavigate();

    const [error, setError] = useState('');

    const load = async () => {
        try {
            const res = await api.get('/vouchers/mine');
            setVouchers(res.data.vouchers);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load vouchers');
        }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id) => {
        if (!confirm('Delete this draft voucher?')) return;
        try {
            await api.delete(`/vouchers/${id}`);
            load();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete voucher');
        }
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" mb={2}>My Vouchers</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Voucher #</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {vouchers.map((v) => (
                        <TableRow key={v.id}>
                            <TableCell>{v.voucher_number}</TableCell>
                            <TableCell>{v.voucher_date}</TableCell>
                            <TableCell>{v.expense_category}</TableCell>
                            <TableCell>₹{v.amount}</TableCell>
                            <TableCell><Chip label={v.status} color={statusColor[v.status]} size="small" /></TableCell>
                            <TableCell align="right">
                                {v.status === 'draft' ? (
                                    <>
                                        <IconButton onClick={() => navigate(`/employee/vouchers/${v.id}/edit`)}><EditIcon /></IconButton>
                                        <IconButton onClick={() => handleDelete(v.id)}><DeleteIcon /></IconButton>
                                    </>
                                ) : (
                                    <IconButton onClick={() => navigate(`/employee/vouchers/${v.id}`)}><VisibilityIcon /></IconButton>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
}