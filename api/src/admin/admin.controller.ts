import { Controller, Get, Patch, Post, Delete, Param, UseGuards, HttpCode } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/pending')
  getPendingUsers() {
    return this.adminService.getPendingUsers();
  }

  @Patch('users/:id/approve')
  approveUser(@Param('id') id: string) {
    return this.adminService.approveUser(id);
  }

  @Patch('users/:id/reject')
  rejectUser(@Param('id') id: string) {
    return this.adminService.rejectUser(id);
  }

  @Post('users/:id/alert')
  sendAlert(@Param('id') id: string) {
    return this.adminService.sendAlertToUser(id);
  }

  @Delete('users/:id')
  @HttpCode(200)
  deleteUser(@Param('id') id: string) {
   return this.adminService.deleteUser(id);
 }
}