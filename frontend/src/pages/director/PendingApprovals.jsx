import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Paper, Table, TableHead, TableRow, TableCell, TableBody,
    Typography, IconButton, Alert,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../services/api';

export default function PendingApprovals() {
    const [vouchers, setVouchers] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const load = async () => {
        try {
            const res = await api.get('/vouchers/pending');
            setVouchers(res.data.vouchers);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load pending approvals');
        }
    };

    useEffect(() => { load(); }, []);

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" mb={2}>Pending Approvals</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Voucher #</TableCell>
                        <TableCell>Employee</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Submitted</TableCell>
                        <TableCell align="right">Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {vouchers.map((v) => (
                        <TableRow key={v.id}>
                            <TableCell>{v.voucher_number}</TableCell>
                            <TableCell>{v.employee_name}</TableCell>
                            <TableCell>{v.department_name}</TableCell>
                            <TableCell>{v.expense_category}</TableCell>
                            <TableCell>₹{v.amount}</TableCell>
                            <TableCell>{v.created_at?.slice(0, 10)}</TableCell>
                            <TableCell align="right">
                                <IconButton onClick={() => navigate(`/director/vouchers/${v.id}`)}>
                                    <VisibilityIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    {vouchers.length === 0 && (
                        <TableRow><TableCell colSpan={7} align="center">No pending approvals</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </Paper>
    );
}