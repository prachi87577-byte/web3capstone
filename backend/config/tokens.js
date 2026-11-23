import jwt from 'jsonwebtoken';
export const signAccess = user => jwt.sign(
  { sub: user._id.toString(), role: user.role, name: user.name },
  process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' }
);
export const signRefresh = user => jwt.sign(
  { sub: user._id.toString(), tokenVersion: user.tokenVersion },
  process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' }
);
