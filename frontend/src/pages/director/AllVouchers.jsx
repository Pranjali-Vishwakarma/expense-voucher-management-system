import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Paper, Table, TableHead, TableRow, TableCell, TableBody,
    Chip, Typography, IconButton, Alert, TableSortLabel
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../services/api';
import VoucherFilterBar from '../../components/VoucherFilterBar';

const statusColor = { draft: 'default', submitted: 'warning', approved: 'success', rejected: 'error' };

export default function DirectorAllVouchers() {
    const [vouchers, setVouchers] = useState([]);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        search: '', status: '', department: '', startDate: '', endDate: '',
        sortBy: 'created_at', sortOrder: 'desc'
    });
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const params = new URLSearchParams();
                Object.keys(filters).forEach(key => {
                    if (filters[key]) params.append(key, filters[key]);
                });
                const res = await api.get(`/vouchers?${params.toString()}`);
                setVouchers(res.data.vouchers);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load vouchers');
            }
        };

        // 300ms debounce to prevent API spam while typing
        const timer = setTimeout(load, 300);
        return () => clearTimeout(timer);
    }, [filters]);

    const handleSort = (field) => {
        setFilters(prev => ({
            ...prev,
            sortBy: field,
            sortOrder: prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc'
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            search: '', status: '', department: '', startDate: '', endDate: '',
            sortBy: 'created_at', sortOrder: 'desc'
        });
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" mb={3}>All Vouchers</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <VoucherFilterBar filters={filters} setFilters={setFilters} onClear={handleClearFilters} />

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <TableSortLabel active={filters.sortBy === 'voucher_number'} direction={filters.sortOrder} onClick={() => handleSort('voucher_number')}>
                                Voucher #
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>Employee</TableCell>
                        <TableCell>
                            <TableSortLabel active={filters.sortBy === 'department_name'} direction={filters.sortOrder} onClick={() => handleSort('department_name')}>
                                Department
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>
                            <TableSortLabel active={filters.sortBy === 'amount'} direction={filters.sortOrder} onClick={() => handleSort('amount')}>
                                Amount
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>
                            <TableSortLabel active={filters.sortBy === 'status'} direction={filters.sortOrder} onClick={() => handleSort('status')}>
                                Status
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>
                            <TableSortLabel active={filters.sortBy === 'created_at'} direction={filters.sortOrder} onClick={() => handleSort('created_at')}>
                                Date Submitted
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">View</TableCell>
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
                            <TableCell><Chip label={v.status} color={statusColor[v.status]} size="small" /></TableCell>
                            <TableCell>{v.created_at?.slice(0, 10)}</TableCell>
                            <TableCell align="right">
                                <IconButton onClick={() => navigate(`/director/vouchers/${v.id}`)}>
                                    <VisibilityIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    {vouchers.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                No vouchers found matching your filters.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Paper>
    );
}
