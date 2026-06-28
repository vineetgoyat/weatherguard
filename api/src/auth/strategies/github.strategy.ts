import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { AuthService } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    const email =
      profile.emails?.[0]?.value || `${profile.username}@github.com`;
    const user = await this.authService.validateOAuthUser({
      name: profile.displayName || profile.username,
      email,
      avatar: profile.photos?.[0]?.value,
      provider: 'github',
      providerId: profile.id,
    });
    done(null, user);
  }
}
