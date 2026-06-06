import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

function getCookieValue(cookieHeader: unknown, name: string): string | null {
  const raw = typeof cookieHeader === 'string' ? cookieHeader : '';
  if (!raw) return null;
  const parts = raw.split(';').map((p) => p.trim());
  for (const p of parts) {
    if (!p.startsWith(name + '=')) continue;
    const v = p.slice(name.length + 1);
    return v ? decodeURIComponent(v) : null;
  }
  return null;
}

const jwtFromCookieOrHeader = ExtractJwt.fromExtractors([
  (req: any) => getCookieValue(req?.headers?.cookie, 'auth_token'),
  ExtractJwt.fromAuthHeaderAsBearerToken(),
]);

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: jwtFromCookieOrHeader,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return {
      sub: payload.sub,
      stakeAddress: payload.stakeAddress,
      paymentAddress: payload.paymentAddress,
      walletAddress: payload.walletAddress,
      profileId: payload.profileId,
      role: payload.role,
      roleCode: payload.role ?? payload.roleCode,
      displayName: payload.displayName,
    };
  }
}
