import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
})

// Attach JWT on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('ag_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global 401 handler — clear storage and redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ag_token')
      localStorage.removeItem('ag_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ---- Auth ----
export const loginAPI    = (data)  => api.post('/login', data)
export const verifyOTP   = (data)  => api.post('/verify-otp', data)

// ---- Admin ----
export const getEmployees    = ()         => api.get('/employees')
export const unblockEmployee = (id)       => api.put(`/unblock/${id}`)
export const registerEmployee = (data)    => api.post('/register-employee', data)
export const getLoginHistory  = ()        => api.get('/login-history')
export const getAlerts        = ()        => api.get('/alerts')
export const markAlertRead    = (empId)   => api.put(`/alerts/${empId}/mark-read`)
export const getAuditLogs     = ()        => api.get('/audit-logs')

// ---- Analytics ----
export const getDashboard       = () => api.get('/dashboard')
export const getRiskDistribution = () => api.get('/risk-distribution')
export const getBrowserStats    = () => api.get('/browser-stats')
export const getLocationStats   = () => api.get('/location-stats')
export const getDepartmentStats = () => api.get('/department-stats')
export const getDailyLogins     = () => api.get('/daily-logins')

// ---- Employee ----
export const getProfile   = () => api.get('/profile')
export const getMyLogins  = () => api.get('/my-logins')

export default api
