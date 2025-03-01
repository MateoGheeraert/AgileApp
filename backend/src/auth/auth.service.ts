import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './models/user.model';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './models/auth.model';
import { JwtService } from '@nestjs/jwt';
// Import bcrypt with require to avoid TypeScript errors
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  private generateToken(user: User): string {
    return this.jwtService.sign(
      { sub: user._id, email: user.email },
      { secret: process.env.JWT_SECRET || 'secretKey' },
    );
  }

  async register(registerInput: RegisterInput): Promise<AuthResponse> {
    const existingUser = await this.userModel.findOne({
      email: registerInput.email,
    });
    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    try {
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(
        registerInput.password,
        saltRounds,
      );

      // Create and save the user
      const user = new this.userModel({
        email: registerInput.email,
        passwordHash: hashedPassword,
        name: registerInput.name,
      });

      await user.save();
      const token = this.generateToken(user);

      return { token, user };
    } catch (err) {
      console.error('Registration error:', err);
      throw new UnauthorizedException('Error during registration process');
    }
  }

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    try {
      const user = await this.userModel.findOne({ email: loginInput.email });
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isValid = await bcrypt.compare(
        loginInput.password,
        user.passwordHash,
      );
      if (!isValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = this.generateToken(user);
      return { token, user };
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      console.error('Login error:', err);
      throw new UnauthorizedException('Error during login process');
    }
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userModel.findById(userId);
  }
}
