import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { signAccess, signRefresh } from '../config/tokens.js';

const sendAuth = (res, user, status=200) => res.status(status).json({
  accessToken: signAccess(user), refreshToken: signRefresh(user),
  user: { id: user._id, name: user.name, email: user.email, role: user.role }
});
export const register = async (req, res) => {
  const { name, email, password, role = 'customer' } = req.body;
  if (!['customer', 'provider'].includes(role)) return res.status(400).json({ message: 'Choose customer or provider role' });
  if (!name || !email || !password || password.length < 8)
    return res.status(400).json({ message: 'Name, valid email and password (8+ characters) are required' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already registered' });
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), role });
  sendAuth(res, user, 201);
};
export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await bcrypt.compare(req.body.password || '', user.password)))
    return res.status(401).json({ message: 'Invalid email or password' });
  if (user.active === false) return res.status(403).json({ message: 'This account has been deactivated' });
  sendAuth(res, user);
};
export const refresh = async (req, res) => {
  try {
    const decoded = jwt.verify(req.body.refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.sub);
    if (!user || user.tokenVersion !== decoded.tokenVersion) return res.status(401).json({ message: 'Refresh token revoked' });
    sendAuth(res, user);
  } catch { res.status(401).json({ message: 'Invalid or expired refresh token' }); }
};
export const logout = async (req, res) => {
  req.user.tokenVersion += 1; await req.user.save();
  res.json({ message: 'Logged out on this account' });
};
export const me = async (req, res) => res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } });
