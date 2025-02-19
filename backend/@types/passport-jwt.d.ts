declare module 'passport-jwt' {
  import { ExtractJwtOptions } from 'passport-jwt';

  export interface StrategyOptions extends ExtractJwtOptions {
    secretOrKey: string;
    jwtFromRequest: (req: any) => string | null;
    ignoreExpiration?: boolean; // Add this line
  }

  export class Strategy {
    constructor(
      options: StrategyOptions,
      verify: (payload: any, done: (err: any, user?: any) => void) => void,
    );
  }

  export const ExtractJwt: {
    fromAuthHeaderAsBearerToken(): (req: any) => string | null;
  };
}
