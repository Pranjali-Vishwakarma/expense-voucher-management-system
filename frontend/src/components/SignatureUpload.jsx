import { useState } from 'react';
import { Box, Button, Typography, Avatar, Alert, CircularProgress } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import api from '../services/api';

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

export default function SignatureUpload({ existingUrl, onUploadSuccess, label = 'Signature' }) {
    const [preview, setPreview] = useState(existingUrl || null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setError('');

        // Client-side validation (mirrors backend rules)
        if (!ALLOWED_TYPES.includes(file.type)) {
            setError('Only JPEG, PNG, or WEBP images are allowed');
            return;
        }
        if (file.size > MAX_SIZE) {
            setError('File too large. Max size is 2MB.');
            return;
        }

        // Local preview immediately
        const localPreviewUrl = URL.createObjectURL(file);
        setPreview(localPreviewUrl);

        // Upload to backend
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('signature', file);
            const res = await api.post('/upload/signature', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onUploadSuccess(res.data.url); // pass the real server URL up to parent form
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
            setPreview(existingUrl || null); // revert preview on failure
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="body2" fontWeight={500}>{label}</Typography>

            {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

            <Box display="flex" alignItems="center" gap={2}>
                {preview ? (
                    <Avatar src={preview} variant="rounded" sx={{ width: 100, height: 50 }} />
                ) : (
                    <Box sx={{
                        width: 100, height: 50, border: '1px dashed', borderColor: 'grey.400',
                        borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Typography variant="caption" color="text.secondary">No signature</Typography>
                    </Box>
                )}

                <Button
                    variant="outlined"
                    component="label"
                    size="small"
                    startIcon={uploading ? <CircularProgress size={16} /> : <UploadFileIcon />}
                    disabled={uploading}
                >
                    {uploading ? 'Uploading...' : preview ? 'Replace' : 'Upload'}
                    <input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
                </Button>
            </Box>
        </Box>
    );
}