import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Room } from '@prisma/client';
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
}
