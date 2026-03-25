import { Controller, Get, Param, Post } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post()
  create(@Body() body: { content: string; userId: string; roomId: string }) {
    return this.messageService.create(body.content, body.userId, body.roomId);
  }

  @Get(':roomId')
  findAll(@Param('roomId') roomId: string) {
    return this.messageService.findAll(roomId);
  }
}
