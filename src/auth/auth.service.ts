import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private jwtSecret(): string {
    return process.env.JWT_SECRET ?? 'dev-only-change-in-production';
  }

  async register(name: string, email: string, password: string) {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !normalized.includes('@')) {
      throw new ConflictException('Invalid email');
    }
    if (password.length < 8) {
      throw new ConflictException('Password must be at least 8 characters');
    }

    const existing = await this.prisma.user.findFirst({
      where: { email: normalized },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        name: name.trim(),
        email: normalized,
        passwordHash,
      },
    });

    return this.issueTokens(user.id, user.name, user.email!);
  }

  async login(email: string, password: string) {
    const normalized = email.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: { email: normalized },
    });
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueTokens(user.id, user.name, user.email!);
  }

  private issueTokens(userId: string, name: string, email: string) {
    const payload = { sub: userId, email };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.jwtSecret(),
        expiresIn: '7d',
      }),
      user: { id: userId, name, email },
    };
  }
}
