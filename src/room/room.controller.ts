import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Room } from '@prisma/client';
import type { AuthUserPayload } from 'src/auth/decorators/current-user.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Get()
  findAll() {
    return this.roomService.findAll();
  }

  @Post()
  create(@Body() body: { name: string }) {
    return this.roomService.create(body.name);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Room> {
    return this.roomService.remove(id);
  }

  @Post('direct')
  @UseGuards(AuthGuard('jwt'))
  createDirect(
    @CurrentUser() user: AuthUserPayload,
    @Body() body: { targetUserId: string; name?: string },
  ) {
    return this.roomService.createDirect(
      user.userId,
      body.targetUserId,
      body.name,
    );
  }

  @Post('group')
  @UseGuards(AuthGuard('jwt'))
  createGroup(
    @CurrentUser() user: AuthUserPayload,
    @Body() body: { name: string; memberIds: string[] },
  ) {
    return this.roomService.createGroup(user.userId, body.name, body.memberIds);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  findMyRooms(@CurrentUser() user: AuthUserPayload) {
    return this.roomService.findMyRooms(user.userId);
  }
}
