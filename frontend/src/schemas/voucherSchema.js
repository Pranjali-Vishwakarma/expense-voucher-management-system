import { z } from 'zod';

export const voucherSchema = z.object({
    voucher_date: z.string().min(1, 'Voucher date is required'),
    expense_date: z.string().min(1, 'Expense date is required'),
    department_name: z.string().min(1, 'Department is required'),
    expense_title: z.string().min(1, 'Expense title is required'),
    expense_category: z.string().min(1, 'Category is required'),
    expense_description: z.string().optional(),
    amount: z.coerce.number().gt(0, 'Amount must be greater than zero'),
});