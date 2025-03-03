import { Args, Mutation, Resolver, Context, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './models/auth.model';
import { Response } from 'express';
import { User } from './models/user.model';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CookieRequest } from './interfaces/cookie-request.interface';

interface GqlContext {
  req: CookieRequest;
  res: Response;
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => User, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async me(@Context() context: GqlContext) {
    return this.authService.validateUser(context.req);
  }

  @Mutation(() => AuthResponse)
  async register(
    @Args('input') input: RegisterInput,
    @Context() context: GqlContext,
  ): Promise<AuthResponse> {
    return this.authService.register(input, context.res);
  }

  @Mutation(() => AuthResponse)
  async login(
    @Args('input') input: LoginInput,
    @Context() context: GqlContext,
  ): Promise<AuthResponse> {
    if (!context.res) {
      throw new Error('Response object (res) is missing in GraphQL context.');
    }
    return this.authService.login(input, context.res);
  }

  @Mutation(() => String)
  async refreshToken(@Context() context: GqlContext): Promise<string> {
    const response = await this.authService.refreshToken(
      context.req,
      context.res,
    );
    return response.accessToken;
  }

  @Mutation(() => Boolean)
  async logout(@Context() context: GqlContext): Promise<boolean> {
    await Promise.resolve(); // Add await to fix the async warning
    // Clear both cookies with same options they were set with
    context.res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    context.res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return true;
  }
}
