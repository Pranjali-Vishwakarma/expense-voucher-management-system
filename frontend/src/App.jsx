import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';

import EmployeeDashboard from './pages/EmployeeDashboard';
import CreateVoucher from './pages/employee/CreateVoucher';
import MyVouchers from './pages/employee/MyVouchers';
import EditVoucher from './pages/employee/EditVoucher';
import VoucherDetails from './pages/employee/VoucherDetails';

import DirectorDashboard from './pages/DirectorDashboard';
import PendingApprovals from './pages/director/PendingApprovals';
import AllVouchers from './pages/director/AllVouchers';
import VoucherApproval from './pages/director/VoucherApproval';

import AccountsDashboard from './pages/AccountsDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Employee routes — AppLayout + sidebar only mount if role === employee */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/create-voucher" element={<CreateVoucher />} />
          <Route path="/employee/my-vouchers" element={<MyVouchers />} />
          <Route path="/employee/vouchers/:id/edit" element={<EditVoucher />} />
          <Route path="/employee/vouchers/:id" element={<VoucherDetails />} />
        </Route>

        {/* Director routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['director']}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/director/dashboard" element={<DirectorDashboard />} />
          <Route path="/director/pending-approvals" element={<PendingApprovals />} />
          <Route path="/director/all-vouchers" element={<AllVouchers />} />
          <Route path="/director/vouchers/:id" element={<VoucherApproval />} />
        </Route>

        {/* Accounts routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['accounts']}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/accounts/dashboard" element={<AccountsDashboard />} />
          {/* all-vouchers added in Phase 6 */}
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;