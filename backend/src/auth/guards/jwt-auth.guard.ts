import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

interface JwtPayload {
  _id: string;
  email: string;
}

interface RequestWithUser extends Request {
  user?: JwtPayload;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext): RequestWithUser {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext<{ req: RequestWithUser }>().req;
  }

  handleRequest<TUser = JwtPayload>(err: any, user: TUser): TUser {
    if (err || !user) {
      console.error('Authentication error:', err || 'User not found');
      throw new UnauthorizedException('User not authenticated');
    }
    return user;
  }
}
