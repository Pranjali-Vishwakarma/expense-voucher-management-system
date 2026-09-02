import { Paper, Typography, Box } from '@mui/material';

export default function StatsCard({ title, value, color = 'primary.main', icon }) {
    return (
        <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            {icon && <Box sx={{ color, '& svg': { fontSize: 40 } }}>{icon}</Box>}
            <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500} textTransform="uppercase">
                    {title}
                </Typography>
                <Typography variant="h4" fontWeight={600} color={color}>
                    {value}
                </Typography>
            </Box>
        </Paper>
    );
}
