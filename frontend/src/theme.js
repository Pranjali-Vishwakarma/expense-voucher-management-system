import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: { main: '#1565c0' },
        background: { default: '#f5f6fa' },
    },
    shape: { borderRadius: 8 },
});

export default theme;