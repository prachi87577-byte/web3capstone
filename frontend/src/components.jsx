import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
export function Protected({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
export function Navbar() {
  const {user,logout}=useAuth(); const nav=useNavigate();
  return <header className="nav"><Link className="brand" to="/">Stay<span>Easy</span></Link><nav><Link to="/">Explore</Link><Link to="/tours">Tours</Link>{user?.role==='customer' && <><Link to="/bookings">My bookings</Link><Link to="/tour-bookings">My tour bookings</Link></>}{user?.role==='provider' && <><Link to="/manager">Provider</Link><Link to="/provider/tours">Tour plans</Link></>}{user?.role==='admin' && <Link to="/admin">Admin</Link>}{user ? <button className="linkbtn" onClick={async()=>{await logout();nav('/')}}>Log out</button> : <><Link to="/login">Log in</Link><Link className="nav-cta" to="/register">Sign up</Link></>}</nav></header>;
}
export function Message({error,success}) { return error ? <p className="error">{error}</p> : success ? <p className="success">{success}</p> : null; }
