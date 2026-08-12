import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext.jsx'

// Pages
import LoginPage        from './pages/LoginPage.jsx'
import OTPPage          from './pages/OTPPage.jsx'
import AdminLayout      from './layouts/AdminLayout.jsx'
import EmployeeLayout   from './layouts/EmployeeLayout.jsx'

// Admin pages
import AdminDashboard   from './pages/admin/Dashboard.jsx'
import AdminEmployees   from './pages/admin/Employees.jsx'
import AdminLoginHistory from './pages/admin/LoginHistory.jsx'
import AdminAlerts      from './pages/admin/Alerts.jsx'
import AdminAnalytics   from './pages/admin/Analytics.jsx'
import AdminAuditLogs   from './pages/admin/AuditLogs.jsx'

// Employee pages
import EmployeeDashboard from './pages/employee/Dashboard.jsx'
import EmployeeProfile   from './pages/employee/Profile.jsx'
import EmployeeLogins    from './pages/employee/MyLogins.jsx'

// Guards
function RequireAuth({ children, role }) {
  const { user, token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (role && user?.role !== role) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' }
        }}
      />
      <Routes>
        <Route path="/"      element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/otp"   element={<OTPPage />} />

        {/* Admin routes */}
        <Route path="/admin" element={
          <RequireAuth role="Admin"><AdminLayout /></RequireAuth>
        }>
          <Route index              element={<AdminDashboard />} />
          <Route path="employees"   element={<AdminEmployees />} />
          <Route path="login-history" element={<AdminLoginHistory />} />
          <Route path="alerts"      element={<AdminAlerts />} />
          <Route path="analytics"   element={<AdminAnalytics />} />
          <Route path="audit-logs"  element={<AdminAuditLogs />} />
        </Route>

        {/* Employee routes */}
        <Route path="/employee" element={
          <RequireAuth role="Employee"><EmployeeLayout /></RequireAuth>
        }>
          <Route index          element={<EmployeeDashboard />} />
          <Route path="profile" element={<EmployeeProfile />} />
          <Route path="logins"  element={<EmployeeLogins />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}
