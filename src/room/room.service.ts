import { Injectable } from '@nestjs/common';
import { Room } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  create(name: string) {
    return this.prisma.room.create({
      data: { name },
    });
  }

  findAll() {
    return this.prisma.room.findMany();
  }

  remove(id: string): Promise<Room> {
    return this.prisma.$transaction(async (tx) => {
      await tx.message.deleteMany({ where: { roomId: id } });
      return tx.room.delete({ where: { id } });
    });
  }
}
