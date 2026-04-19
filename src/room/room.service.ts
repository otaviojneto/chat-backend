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

  async createDirect(
    currentUserId: string,
    targetUserId: string,
    nameOverride?: string,
  ) {
    if (!targetUserId) {
      throw new BadRequestException('targetUserId is required');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!target) {
      throw new NotFoundException('Target user not found');
    }

    const directKey = `direct:${[currentUserId, targetUserId].sort().join(':')}`;
    const roomName =
      nameOverride?.trim() ||
      target.name.trim() ||
      (currentUserId === targetUserId ? 'You' : directKey);

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
        const shouldFixLegacyName =
          roomName &&
          existingDirect.name.startsWith('direct:') &&
          existingDirect.name !== roomName;
        if (shouldFixLegacyName) {
          return tx.room.update({
            where: { id: existingDirect.id },
            data: { name: roomName },
            include: { members: true },
          });
        }
        return existingDirect;
      }

      const memberRows =
        currentUserId === targetUserId
          ? [{ userId: currentUserId, role: 'OWNER' as const }]
          : [
              { userId: currentUserId, role: 'OWNER' as const },
              { userId: targetUserId, role: 'MEMBER' as const },
            ];

      return tx.room.create({
        data: {
          name: roomName,
          type: 'DIRECT',
          members: {
            createMany: {
              data: memberRows,
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
