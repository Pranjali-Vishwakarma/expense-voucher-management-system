import { Box, TextField, MenuItem, Button, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';

export default function VoucherFilterBar({ filters, setFilters, onClear }) {
    const handleChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <Box display="flex" flexWrap="wrap" gap={2} mb={3} alignItems="center">
            <TextField
                name="search"
                value={filters.search}
                onChange={handleChange}
                placeholder="Search voucher # or employee"
                size="small"
                InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                }}
                sx={{ flexGrow: 1, minWidth: 200 }}
            />
            <TextField
                select
                name="status"
                label="Status"
                value={filters.status}
                onChange={handleChange}
                size="small"
                sx={{ minWidth: 120 }}
            >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
            <TextField
                select
                name="department"
                label="Department"
                value={filters.department}
                onChange={handleChange}
                size="small"
                sx={{ minWidth: 150 }}
            >
                <MenuItem value="">All Depts</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
                <MenuItem value="Operations">Operations</MenuItem>
            </TextField>
            <TextField
                type="date"
                name="startDate"
                label="Start Date"
                value={filters.startDate}
                onChange={handleChange}
                size="small"
                InputLabelProps={{ shrink: true }}
            />
            <TextField
                type="date"
                name="endDate"
                label="End Date"
                value={filters.endDate}
                onChange={handleChange}
                size="small"
                InputLabelProps={{ shrink: true }}
            />
            <Button variant="text" color="inherit" startIcon={<FilterAltOffIcon />} onClick={onClear}>
                Clear
            </Button>
        </Box>
    );
}
