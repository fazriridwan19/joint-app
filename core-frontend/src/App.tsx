import { useEffect } from 'react'
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom'
import { AuthScreen } from './features/auth/ui/AuthScreen'
import { useAuthStore } from './features/auth/model/auth-store'
import { AppShell } from './components/layout/AppShell'
import { DashboardScreen } from './features/dashboard/ui/DashboardScreen'
import { ApplicationsScreen } from './features/applications/ui/ApplicationsScreen'
import { ApplicationDetailScreen } from './features/applications/ui/ApplicationDetailScreen'
import { CompaniesScreen } from './features/applications/ui/CompaniesScreen'
import { ContactsScreen } from './features/productivity/ui/ContactsScreen'
import { RemindersScreen } from './features/productivity/ui/RemindersScreen'
import { Spinner } from './components/ui/spinner'

// ─── Route guards ─────────────────────────────────────────────────────────────

function RequireAuth() {
  const { user, isRestoring } = useAuthStore()
  if (isRestoring) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#f5f6f0]">
        <Spinner className="size-8" />
      </div>
    )
  }
  return user ? <Outlet /> : <Navigate to="/auth" replace />
}

function RequireGuest() {
  const { user, isRestoring } = useAuthStore()
  if (isRestoring) return null
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const restoreSession = useAuthStore((s) => s.restoreSession)

  // Restore session on mount (check stored token)
  useEffect(() => {
    void restoreSession()
  }, [restoreSession])

  return (
    <BrowserRouter>
      <Routes>
        {/* Guest routes */}
        <Route element={<RequireGuest />}>
          <Route path="/auth" element={<AuthScreen />} />
        </Route>

        {/* Protected routes */}
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/applications" element={<ApplicationsScreen />} />
            <Route path="/applications/:id" element={<ApplicationDetailScreen />} />
            <Route path="/companies" element={<CompaniesScreen />} />
            <Route path="/contacts" element={<ContactsScreen />} />
            <Route path="/reminders" element={<RemindersScreen />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
