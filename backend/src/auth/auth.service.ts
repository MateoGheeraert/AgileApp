import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './models/user.model';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './models/auth.model';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

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

    const hashedPassword = await hash(registerInput.password, 10);
    const user = new this.userModel({
      email: registerInput.email,
      passwordHash: hashedPassword,
      name: registerInput.name,
    });

    await user.save();
    const token = this.generateToken(user);

    return { token, user };
  }

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const user = await this.userModel.findOne({ email: loginInput.email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await compare(loginInput.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);
    return { token, user };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userModel.findById(userId);
  }
}
