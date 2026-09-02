import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import {
    Box, Paper, TextField, Button, Typography, MenuItem, Alert,
} from '@mui/material';
import { voucherSchema } from '../../schemas/voucherSchema';
import api from '../../services/api';
import SignatureUpload from '../../components/SignatureUpload';

const DEPARTMENTS = ['Sales', 'Engineering', 'HR', 'Finance', 'Operations'];
const CATEGORIES = ['Travel', 'Food', 'Supplies', 'Software', 'Other'];

export default function CreateVoucher() {
    const [error, setError] = useState('');
    const [signatureFile, setSignatureFile] = useState(null);
    const [signatureUrl, setSignatureUrl] = useState(null);
    const navigate = useNavigate();

    const { register, control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(voucherSchema),
    });

    const submitVoucher = async (data, action) => {
        setError('');
        if (action === 'submit' && !signatureUrl) {
            setError('Signature is required before submission');
            return;
        }
        try {
            await api.post('/vouchers', { ...data, employee_signature_url: signatureUrl, action });
            navigate('/employee/my-vouchers');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save voucher');
        }
    };

    return (
        <Paper sx={{ p: 4, maxWidth: 600 }}>
            <Typography variant="h5" mb={3}>Create Voucher</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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

                <SignatureUpload onUploadSuccess={setSignatureUrl} />
                {signatureFile && <Typography variant="caption">{signatureFile.name}</Typography>}

                <Box display="flex" gap={2} mt={2}>
                    <Button variant="outlined" onClick={handleSubmit((d) => submitVoucher(d, 'draft'))}>
                        Save as Draft
                    </Button>
                    <Button variant="contained" onClick={handleSubmit((d) => submitVoucher(d, 'submit'))}>
                        Submit for Approval
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
}