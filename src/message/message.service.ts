import { Injectable } from '@nestjs/common';
import { ChatGateway } from 'src/chat/chat.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoomService } from 'src/room/room.service';

@Injectable()
export class MessageService {
  constructor(
    private prisma: PrismaService,
    private chatGateway: ChatGateway,
    private roomService: RoomService,
  ) {}

  async create(content: string, userId: string, roomId: string) {
    await this.roomService.assertUserCanAccessRoom(userId, roomId);

    const message = await this.prisma.message.create({
      data: {
        content,
        userId,
        roomId,
      },
      include: {
        user: true,
        room: true,
      },
    });

    this.chatGateway.sendMessage(message);
    return message;
  }

  async findAll(userId: string, roomId: string) {
    await this.roomService.assertUserCanAccessRoom(userId, roomId);

    return this.prisma.message.findMany({
      where: {
        roomId,
      },
      include: {
        user: true,
        room: true,
      },
    });
  }
}
