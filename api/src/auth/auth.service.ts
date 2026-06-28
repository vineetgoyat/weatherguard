import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateOAuthUser(profile: {
    name: string;
    email: string;
    avatar: string;
    provider: string;
    providerId: string;
  }) {
    const user = await this.usersService.findOrCreate(profile);
    return user;
  }

  async generateToken(user: any) {
    const payload = { sub: user._id.toString(), email: user.email, isAdmin: user.isAdmin };
    return { access_token: this.jwtService.sign(payload), user };
  }
}
