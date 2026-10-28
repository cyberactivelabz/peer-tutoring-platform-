import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/services/users.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  purpose?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub || (payload.purpose !== undefined && payload.purpose !== 'ACCESS')) {
      throw new UnauthorizedException('This token cannot be used to access the application');
    }
    let user;
    try {
      user = await this.usersService.findById(payload.sub);
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new UnauthorizedException('User account no longer active or exists');
      throw error;
    }
    if (!user || !user.isActive || !user.isVerified) {
      throw new UnauthorizedException('User account no longer active or exists');
    }
    return user;
  }
}
