import { Controller, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Patch('me/city')
  async updateCity(@Request() req, @Body('city') city: string) {
    return this.usersService.updateCity(req.user.id, city);
  }

  @Patch('me/request-message')
  async updateRequestMessage(@Request() req, @Body('message') message: string) {
    return this.usersService.updateRequestMessage(req.user.id, message);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
