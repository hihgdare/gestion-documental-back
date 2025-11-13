import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '@shared/domain/errors';

export interface JwtPayload {
  userId: string;
  email: string;
  roleId: string;
}

export interface DecodedToken extends JwtPayload {
  iat: number;
  exp: number;
}

export class JwtService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  public generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn as any,
    });
  }

  public verifyToken(token: string): DecodedToken {
    try {
      const decoded = jwt.verify(token, this.secret) as DecodedToken;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token');
      }
      throw new UnauthorizedError('Token verification failed');
    }
  }

  public decodeToken(token: string): DecodedToken | null {
    try {
      const decoded = jwt.decode(token) as DecodedToken;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}
