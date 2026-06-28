import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'vineet-weatherguard-secret-key-2026-xyz789abc',
    });
  }

  async validate(payload: any) {
    console.log('JWT validated, payload:', payload);
    return { id: payload.sub, email: payload.email, isAdmin: payload.isAdmin };
  }
}