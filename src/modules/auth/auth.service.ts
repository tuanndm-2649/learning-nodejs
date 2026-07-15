import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { SignOptions } from 'jsonwebtoken';
import { I18nService } from 'nestjs-i18n';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenPair,
} from 'src/common/interfaces/token-payload.interface';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';

@Injectable()
export class AuthService {
  private readonly saltRounds = 12;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException(this.i18n.t('auth.error.userExists'));
    }

    const user = await this.usersService.create(dto);

    return user;
  }

  async login(dto: LoginDto): Promise<TokenPair> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException(
        this.i18n.t('auth.error.invalidEmailPassword'),
      );
    }

    const passwordMatched = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatched) {
      throw new UnauthorizedException(
        this.i18n.t('auth.error.invalidEmailPassword'),
      );
    }

    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshTokenHash = await bcrypt.hash(
      tokens.refreshToken,
      this.saltRounds,
    );

    await this.usersService.updateRefreshTokenHash(user.id, refreshTokenHash);

    return tokens;
  }

  private async generateTokens(user: {
    id: number;
    email: string;
    role: string;
  }): Promise<TokenPair> {
    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      type: 'refresh',
    };

    const refreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload),

      this.jwtService.signAsync(refreshPayload, {
        secret: refreshSecret,
        expiresIn: this.configService.getOrThrow<SignOptions['expiresIn']>(
          'JWT_REFRESH_EXPIRES_IN',
        ),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    let payload: RefreshTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );
    } catch {
      throw new UnauthorizedException(
        this.i18n.t('auth.error.refreshTokenInvalid'),
      );
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException(
        this.i18n.t('auth.error.refreshTokenInvalid'),
      );
    }

    const user = await this.usersService.findByIdWithRefreshTokenHash(
      payload.sub,
    );

    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException(
        this.i18n.t('auth.error.refreshTokenInvalid'),
      );
    }

    const refreshTokenMatched = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!refreshTokenMatched) {
      throw new UnauthorizedException(
        this.i18n.t('auth.error.refreshTokenInvalid'),
      );
    }

    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Rotation: lưu hash refresh token mới
    const newRefreshTokenHash = await bcrypt.hash(
      tokens.refreshToken,
      this.saltRounds,
    );

    await this.usersService.updateRefreshTokenHash(
      user.id,
      newRefreshTokenHash,
    );

    return tokens;
  }
}
