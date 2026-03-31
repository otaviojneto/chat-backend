import { Controller, Get, Post } from '@nestjs/common';
import { Body } from '@nestjs/common';
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
}
