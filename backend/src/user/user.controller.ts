import { Controller, Get, Patch, Delete, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../auth/decorators';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getMe(@CurrentUser() user: { id: string; address: string }) {
    return this.userService.findOne(user.id);
  }

  @Patch('me')
  updateMe(
    @CurrentUser() user: { id: string; address: string },
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(user.id, dto);
  }

  @Delete('me')
  deleteMe(@CurrentUser() user: { id: string; address: string }) {
    return this.userService.remove(user.id);
  }
}
