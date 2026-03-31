import { Injectable } from '@nestjs/common';
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
}
