import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box, Paper, TextField, Button, Typography, MenuItem, Alert, CircularProgress,
} from '@mui/material';
import { voucherSchema } from '../../schemas/voucherSchema';
import api from '../../services/api';

const DEPARTMENTS = ['Sales', 'Engineering', 'HR', 'Finance', 'Operations'];
const CATEGORIES = ['Travel', 'Food', 'Supplies', 'Software', 'Other'];

export default function EditVoucher() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [signatureFile, setSignatureFile] = useState(null);
    const [existingSignatureUrl, setExistingSignatureUrl] = useState(null);

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(voucherSchema),
    });

    useEffect(() => {
        const loadVoucher = async () => {
            try {
                const res = await api.get(`/vouchers/${id}`);
                const v = res.data.voucher;

                if (v.status !== 'draft') {
                    setError('Only draft vouchers can be edited');
                    setLoading(false);
                    return;
                }

                reset({
                    voucher_date: v.voucher_date?.slice(0, 10),
                    expense_date: v.expense_date?.slice(0, 10),
                    department_name: v.department_name,
                    expense_category: v.expense_category,
                    expense_title: v.expense_title,
                    expense_description: v.expense_description || '',
                    amount: v.amount,
                });
                setExistingSignatureUrl(v.employee_signature_url);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load voucher');
            } finally {
                setLoading(false);
            }
        };
        loadVoucher();
    }, [id, reset]);

    const submitVoucher = async (data, action) => {
        setError('');
        try {
            let employee_signature_url = existingSignatureUrl;

            if (signatureFile) {
                const formData = new FormData();
                formData.append('signature', signatureFile);
                const uploadRes = await api.post('/upload/signature', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                employee_signature_url = uploadRes.data.url;
            }

            if (action === 'submit' && !employee_signature_url) {
                setError('Signature is required before submission');
                return;
            }

            await api.put(`/vouchers/${id}`, { ...data, employee_signature_url, action });
            navigate('/employee/my-vouchers');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update voucher');
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Paper sx={{ p: 4, maxWidth: 600 }}>
            <Typography variant="h5" mb={3}>Edit Draft Voucher</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {!error && (
                <Box display="flex" flexDirection="column" gap={2}>
                    <TextField label="Voucher Date" type="date" InputLabelProps={{ shrink: true }}
                        {...register('voucher_date')} error={!!errors.voucher_date} helperText={errors.voucher_date?.message} />
                    <TextField label="Expense Date" type="date" InputLabelProps={{ shrink: true }}
                        {...register('expense_date')} error={!!errors.expense_date} helperText={errors.expense_date?.message} />

                    <Controller
                        name="department_name"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <TextField select label="Department" {...field}
                                error={!!errors.department_name} helperText={errors.department_name?.message}>
                                {DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                            </TextField>
                        )}
                    />

                    <TextField label="Expense Title" {...register('expense_title')}
                        error={!!errors.expense_title} helperText={errors.expense_title?.message} />

                    <Controller
                        name="expense_category"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <TextField select label="Expense Category" {...field}
                                error={!!errors.expense_category} helperText={errors.expense_category?.message}>
                                {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                            </TextField>
                        )}
                    />

                    <TextField label="Description" multiline rows={3} {...register('expense_description')} />
                    <TextField label="Amount" type="number" {...register('amount')}
                        error={!!errors.amount} helperText={errors.amount?.message} />

                    <Button variant="outlined" component="label">
                        {existingSignatureUrl ? 'Replace Signature' : 'Upload Signature'}
                        <input type="file" hidden accept="image/*" onChange={(e) => setSignatureFile(e.target.files[0])} />
                    </Button>
                    {signatureFile && <Typography variant="caption">{signatureFile.name}</Typography>}
                    {!signatureFile && existingSignatureUrl && (
                        <Typography variant="caption" color="text.secondary">Signature already on file</Typography>
                    )}

                    <Box display="flex" gap={2} mt={2}>
                        <Button variant="outlined" onClick={handleSubmit((d) => submitVoucher(d, 'draft'))}>
                            Update Draft
                        </Button>
                        <Button variant="contained" onClick={handleSubmit((d) => submitVoucher(d, 'submit'))}>
                            Submit for Approval
                        </Button>
                    </Box>
                </Box>
            )}
        </Paper>
    );
}