import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './models/user.model';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './models/auth.model';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { CookieRequest } from './interfaces/cookie-request.interface';
import { JwtPayload, TokenResponse } from './interfaces/jwt.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  private generateTokens(user: User): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload: JwtPayload = { sub: user._id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private setTokenCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    // Set access token cookie
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Set refresh token cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  async validateUser(req: CookieRequest): Promise<User> {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const user = await this.userModel.findById(req.user.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async register(
    registerInput: RegisterInput,
    res: Response,
  ): Promise<AuthResponse> {
    const existingUser = await this.userModel.findOne({
      email: registerInput.email,
    });
    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerInput.password, 10);
    const user = new this.userModel({
      email: registerInput.email,
      passwordHash: hashedPassword,
      name: registerInput.name,
    });

    await user.save();
    const { accessToken, refreshToken } = this.generateTokens(user);

    this.setTokenCookies(res, accessToken, refreshToken);

    return { token: accessToken, user };
  }

  async login(loginInput: LoginInput, res: Response): Promise<AuthResponse> {
    const user = await this.userModel.findOne({ email: loginInput.email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(
      loginInput.password,
      user.passwordHash,
    );
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const { accessToken, refreshToken } = this.generateTokens(user);

    this.setTokenCookies(res, accessToken, refreshToken);

    return { token: accessToken, user };
  }

  async refreshToken(
    req: CookieRequest,
    res: Response,
  ): Promise<TokenResponse> {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userModel.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = this.generateTokens(user);
      this.setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

      return { accessToken: tokens.accessToken };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
