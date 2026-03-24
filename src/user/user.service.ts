import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  create(name: string) {
    return this.prisma.user.create({ data: { name } });
  }

  findAll() {
    return this.prisma.user.findMany();
  }
}
