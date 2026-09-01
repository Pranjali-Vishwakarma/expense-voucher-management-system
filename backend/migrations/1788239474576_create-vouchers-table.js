/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.createTable('vouchers', {
        id: 'id',
        voucher_number: { type: 'varchar(50)', notNull: true, unique: true },
        voucher_date: { type: 'date', notNull: true },
        expense_date: { type: 'date', notNull: true },
        department_name: { type: 'varchar(100)', notNull: true },
        expense_title: { type: 'varchar(150)', notNull: true },
        expense_category: { type: 'varchar(100)', notNull: true },
        expense_description: { type: 'text' },
        amount: { type: 'numeric(12,2)', notNull: true },

        employee_id: { type: 'integer', notNull: true, references: 'users', onDelete: 'cascade' },
        employee_signature_url: { type: 'varchar(255)' },

        status: { type: 'varchar(20)', notNull: true, default: 'draft' }, // draft | submitted | approved | rejected
        director_signature_url: { type: 'varchar(255)' },
        approval_date: { type: 'timestamp' },
        rejection_reason: { type: 'text' },

        created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
        updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('vouchers');
};
