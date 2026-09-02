import { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';

export default function GlobalToast() {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('error');

    useEffect(() => {
        // Listen for a custom DOM event from anywhere in the app
        const handleToast = (event) => {
            setMessage(event.detail.message);
            setSeverity(event.detail.severity || 'error');
            setOpen(true);
        };

        window.addEventListener('show-toast', handleToast);
        return () => window.removeEventListener('show-toast', handleToast);
    }, []);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setOpen(false);
    };

    return (
        <Snackbar
            open={open}
            autoHideDuration={4000}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
            <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }} variant="filled">
                {message}
            </Alert>
        </Snackbar>
    );
}

// Helper utility that can be imported into non-React files (like api.js)
export const toast = {
    error: (message) => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, severity: 'error' } })),
    success: (message) => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, severity: 'success' } })),
    info: (message) => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, severity: 'info' } })),
};
