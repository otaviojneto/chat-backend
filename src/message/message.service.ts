import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  create(content: string, userId: string, roomId: string) {
    return this.prisma.message.create({
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
