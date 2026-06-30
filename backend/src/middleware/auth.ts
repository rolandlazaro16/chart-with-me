import { SignJWT, jwtVerify } from 'jose';
import { Request, Response, NextFunction } from 'express';

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key-do-not-use-in-prod';
  return new TextEncoder().encode(secret);
};

export async function signToken(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(getJwtSecretKey());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload;
  } catch (error) {
    return null;
  }
}

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.auth_token;
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
