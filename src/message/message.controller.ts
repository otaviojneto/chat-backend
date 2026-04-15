import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUserPayload } from 'src/auth/decorators/current-user.decorator';
import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @CurrentUser() user: AuthUserPayload,
    @Body() body: { content: string; roomId: string },
  ) {
    return this.messageService.create(body.content, user.userId, body.roomId);
  }

  @Get(':roomId')
  findAll(@Param('roomId') roomId: string) {
    return this.messageService.findAll(roomId);
  }
}
