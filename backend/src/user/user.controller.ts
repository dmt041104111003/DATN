import { Controller, Get, Patch, Delete, Body, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../auth/decorators';
import { UpsertAgentDto } from './dto/upsert-agent.dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getMe(@CurrentUser() user: { id: string; address: string }) {
    return this.userService.findOne(user.id);
  }

  @Get('agents')
  listAgents(@CurrentUser() user: { id: string; address: string }) {
    return this.userService.listAgents(user.id);
  }

  @Post('agents')
  upsertAgent(
    @CurrentUser() user: { id: string; address: string },
    @Body() dto: UpsertAgentDto,
  ) {
    return this.userService.upsertAgent(user.id, dto);
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
