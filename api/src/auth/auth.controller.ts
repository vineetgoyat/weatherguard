import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res) {
    const { access_token } = await this.authService.generateToken(req.user);
    console.log('✅ Google login success, redirecting with token...');
    return res.redirect(`http://localhost:5173/auth/callback?token=${access_token}`);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubAuth() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req, @Res() res) {
    const { access_token } = await this.authService.generateToken(req.user);
    console.log('✅ GitHub login success, redirecting with token...');
    return res.redirect(`http://localhost:5173/auth/callback?token=${access_token}`);
  }
}