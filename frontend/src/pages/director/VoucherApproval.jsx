import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Paper, Typography, Grid, Chip, Divider, Box, CircularProgress,
    Alert, Button, TextField,
} from '@mui/material';
import api from '../../services/api';
import SignatureUpload from '../../components/SignatureUpload';

const statusColor = { draft: 'default', submitted: 'warning', approved: 'success', rejected: 'error' };

function Field({ label, value }) {
    return (
        <Box mb={1.5}>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
            <Typography variant="body1">{value ?? '—'}</Typography>
        </Box>
    );
}

export default function VoucherApproval() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [voucher, setVoucher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionError, setActionError] = useState('');
    const [directorSignatureUrl, setDirectorSignatureUrl] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const load = async () => {
        try {
            const res = await api.get(`/vouchers/${id}`);
            setVoucher(res.data.voucher);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load voucher');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [id]);

    const handleApprove = async () => {
        setActionError('');
        if (!directorSignatureUrl) {
            setActionError('Please upload your signature before approving');
            return;
        }
        setSubmitting(true);
        try {
            await api.patch(`/vouchers/${id}/approve`, { director_signature_url: directorSignatureUrl });
            navigate('/director/pending-approvals');
        } catch (err) {
            setActionError(err.response?.data?.message || 'Failed to approve voucher');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        setActionError('');
        if (!rejectionReason.trim()) {
            setActionError('Please provide a rejection reason');
            return;
        }
        setSubmitting(true);
        try {
            await api.patch(`/vouchers/${id}/reject`, { rejection_reason: rejectionReason });
            navigate('/director/pending-approvals');
        } catch (err) {
            setActionError(err.response?.data?.message || 'Failed to reject voucher');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!voucher) return null;

    const isPending = voucher.status === 'submitted';

    return (
        <Paper sx={{ p: 4, maxWidth: 700 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">{voucher.voucher_number}</Typography>
                <Chip label={voucher.status} color={statusColor[voucher.status]} />
            </Box>

            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle1" fontWeight={600} mb={1}>Basic Information</Typography>
            <Grid container spacing={2}>
                <Grid item xs={6}><Field label="Employee" value={voucher.employee_name} /></Grid>
                <Grid item xs={6}><Field label="Department" value={voucher.department_name} /></Grid>
                <Grid item xs={6}><Field label="Voucher Date" value={voucher.voucher_date?.slice(0, 10)} /></Grid>
                <Grid item xs={6}><Field label="Expense Date" value={voucher.expense_date?.slice(0, 10)} /></Grid>
                <Grid item xs={6}><Field label="Category" value={voucher.expense_category} /></Grid>
                <Grid item xs={6}><Field label="Amount" value={`₹${voucher.amount}`} /></Grid>
                <Grid item xs={12}><Field label="Expense Title" value={voucher.expense_title} /></Grid>
                <Grid item xs={12}><Field label="Description" value={voucher.expense_description} /></Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight={600} mb={1}>Employee Signature</Typography>
            {voucher.employee_signature_url ? (
                <img src={voucher.employee_signature_url} alt="Employee signature" style={{ maxHeight: 60 }} />
            ) : (
                <Typography variant="body2" color="text.secondary">Not uploaded</Typography>
            )}

            {/* Approval action panel — only rendered when voucher is still pending */}
            {isPending && (
                <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" fontWeight={600} mb={2}>Approval Action</Typography>

                    {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}

                    {!showRejectForm ? (
                        <>
                            <SignatureUpload label="Director Signature" onUploadSuccess={setDirectorSignatureUrl} />
                            <Box display="flex" gap={2} mt={3}>
                                <Button variant="contained" color="success" onClick={handleApprove} disabled={submitting}>
                                    Approve
                                </Button>
                                <Button variant="outlined" color="error" onClick={() => setShowRejectForm(true)} disabled={submitting}>
                                    Reject
                                </Button>
                            </Box>
                        </>
                    ) : (
                        <>
                            <TextField
                                label="Rejection Reason"
                                multiline
                                rows={3}
                                fullWidth
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                required
                            />
                            <Box display="flex" gap={2} mt={2}>
                                <Button variant="contained" color="error" onClick={handleReject} disabled={submitting}>
                                    Confirm Reject
                                </Button>
                                <Button variant="text" onClick={() => setShowRejectForm(false)} disabled={submitting}>
                                    Cancel
                                </Button>
                            </Box>
                        </>
                    )}
                </>
            )}

            {/* Read-only approval info — only rendered when voucher is already decided */}
            {!isPending && (
                <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" fontWeight={600} mb={1}>Approval Information</Typography>
                    <Grid container spacing={2}>
                        {voucher.status === 'approved' && (
                            <>
                                <Grid item xs={6}><Field label="Approval Date" value={voucher.approval_date?.slice(0, 10)} /></Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">Director Signature</Typography>
                                    <Box mt={0.5}>
                                        {voucher.director_signature_url && (
                                            <img src={voucher.director_signature_url} alt="Director signature" style={{ maxHeight: 60 }} />
                                        )}
                                    </Box>
                                </Grid>
                            </>
                        )}
                        {voucher.status === 'rejected' && (
                            <Grid item xs={12}><Field label="Rejection Reason" value={voucher.rejection_reason} /></Grid>
                        )}
                    </Grid>
                </>
            )}

            <Box mt={3}>
                <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
            </Box>
        </Paper>
    );
}