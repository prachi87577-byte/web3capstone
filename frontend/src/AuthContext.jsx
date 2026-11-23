import { createContext, useContext, useState } from 'react';
import { api } from './api';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const save = data => { localStorage.setItem('accessToken', data.accessToken); localStorage.setItem('refreshToken', data.refreshToken); localStorage.setItem('user', JSON.stringify(data.user)); setUser(data.user); };
  const login = async (email,password) => save(await api('/auth/login',{method:'POST',body:JSON.stringify({email,password})}));
  const register = async form => save(await api('/auth/register',{method:'POST',body:JSON.stringify(form)}));
  const logout = async () => { try { await api('/auth/logout',{method:'POST'}); } catch {} ['accessToken','refreshToken','user'].forEach(k=>localStorage.removeItem(k)); setUser(null); };
  return <AuthContext.Provider value={{user,login,register,logout}}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
