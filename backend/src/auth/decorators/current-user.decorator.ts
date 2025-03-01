import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

interface JwtPayload {
  _id: string;
  email: string;
}

interface RequestWithUser extends Request {
  user?: JwtPayload;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string | undefined => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext<{ req: RequestWithUser }>().req;

    console.log('User in CurrentUser decorator:', request.user);

    // Return the user ID directly from the user object
    return request.user?._id;
  },
);
