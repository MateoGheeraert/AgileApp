import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

interface JwtPayload {
  sub: string;
  email: string;
}

interface RequestWithUser extends Request {
  user?: JwtPayload;
}

interface GqlContext {
  req: RequestWithUser;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): string | undefined => {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext<GqlContext>();
    return req.user?.sub;
  },
);
