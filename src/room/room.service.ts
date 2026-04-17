import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  createDirect(currentUserId: string, targetUserId: string) {
    if (!targetUserId) {
      throw new BadRequestException('targetUserId is required');
    }

    if (currentUserId === targetUserId) {
      throw new BadRequestException(
        'You cannot create a direct conversation with yourself',
      );
    }

    const directName = `direct:${[currentUserId, targetUserId].sort().join(':')}`;

    return this.prisma.$transaction(async (tx) => {
      const existingDirect = await tx.room.findFirst({
        where: {
          type: 'DIRECT',
          AND: [
            { members: { some: { userId: currentUserId } } },
            { members: { some: { userId: targetUserId } } },
            {
              members: {
                every: { userId: { in: [currentUserId, targetUserId] } },
              },
            },
          ],
        },
        include: {
          members: true,
        },
      });

      if (existingDirect) {
        return existingDirect;
      }

      return tx.room.create({
        data: {
          name: directName,
          type: 'DIRECT',
          members: {
            createMany: {
              data: [
                { userId: currentUserId, role: 'OWNER' },
                { userId: targetUserId, role: 'MEMBER' },
              ],
            },
          },
        },
        include: {
          members: true,
        },
      });
    });
  }

  createGroup(currentUserId: string, name: string, memberIds: string[]) {
    if (!name?.trim()) {
      throw new BadRequestException('Group name is required');
    }

    const uniqueMemberIds = Array.from(
      new Set([currentUserId, ...(memberIds ?? [])]),
    );

    if (uniqueMemberIds.length < 2) {
      throw new BadRequestException(
        'A group must contain at least 2 participants',
      );
    }

    return this.prisma.room.create({
      data: {
        name: name.trim(),
        type: 'GROUP',
        members: {
          createMany: {
            data: uniqueMemberIds.map((userId) => ({
              userId,
              role: userId === currentUserId ? 'OWNER' : 'MEMBER',
            })),
          },
        },
      },
      include: {
        members: true,
      },
    });
  }

  /**
   * Salas PUBLIC: qualquer usuário autenticado pode ler/escrever (ex.: canal geral).
   * DIRECT / GROUP: só quem está em RoomMember.
   */
  async assertUserCanAccessRoom(userId: string, roomId: string): Promise<void> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: { type: true },
    });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    if (room.type === 'PUBLIC') {
      return;
    }
    const member = await this.prisma.roomMember.findUnique({
      where: {
        roomId_userId: { roomId, userId },
      },
    });
    if (!member) {
      throw new ForbiddenException('You are not a member of this room');
    }
  }

  findMyRooms(userId: string) {
    return this.prisma.room.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: true,
      },
      orderBy: {
        id: 'desc',
      },
    });
  }
}
