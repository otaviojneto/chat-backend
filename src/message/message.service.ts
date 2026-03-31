import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatGateway } from 'src/chat/chat.gateway';

@Injectable()
export class MessageService {
  constructor(
    private prisma: PrismaService,
    private chatGateway: ChatGateway,
  ) {}

  async create(content: string, userId: string, roomId: string) {
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

  findAll(roomId: string) {
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
