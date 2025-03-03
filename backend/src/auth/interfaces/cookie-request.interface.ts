import { Request } from 'express';
import { JwtPayload } from './jwt.interface';

export interface CookieRequest extends Request {
  cookies: {
    token?: string;
    refresh_token?: string;
  };
  user?: JwtPayload;
}
