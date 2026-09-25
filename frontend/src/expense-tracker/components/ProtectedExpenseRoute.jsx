import { Navigate, useLocation } from 'react-router-dom'

function ProtectedExpenseRoute({ isAuthenticated, children }) {
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

export default ProtectedExpenseRoute
