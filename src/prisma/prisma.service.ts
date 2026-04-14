import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type Prisma, type UserSettings } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL is not set. Add it to .env or the environment before starting the app.',
      );
    }
    super({
      adapter: new PrismaPg({ connectionString }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async upsertUserSettings(
    args: Prisma.UserSettingsUpsertArgs,
  ): Promise<UserSettings> {
    return await this.userSettings.upsert(args);
  }

  async findUniqueUserSettings(
    args: Prisma.UserSettingsFindUniqueArgs,
  ): Promise<Awaited<ReturnType<PrismaClient['userSettings']['findUnique']>>> {
    return await this.userSettings.findUnique(args);
  }

  /** Inclui `user.name` para montar respostas agregadas sem um segundo round-trip. */
  async findUniqueUserSettingsWithUserName(userId: string) {
    return await this.userSettings.findUnique({
      where: { userId },
      include: { user: { select: { name: true } } },
    });
  }
}
