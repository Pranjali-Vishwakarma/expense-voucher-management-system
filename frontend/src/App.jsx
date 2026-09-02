import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GlobalToast from './components/GlobalToast';

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
import AccountsAllVouchers from './pages/accounts/AllVouchers';
import AccountsVoucherDetails from './pages/accounts/VoucherDetails';

function App() {
  return (
    <BrowserRouter>
      <GlobalToast />
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
          <Route path="/accounts/all-vouchers" element={<AccountsAllVouchers />} />
          <Route path="/accounts/vouchers/:id" element={<AccountsVoucherDetails />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;