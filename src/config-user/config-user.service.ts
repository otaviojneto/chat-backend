import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { UpsertUserSettingsDto } from './dto/upsert-user-settings.dto';

/**
 * Preferências (`UserSettings`) mais o nome em `User`.
 * Tipo estrutural (espelha o model Prisma) para evitar interseção com tipos gerados
 * que o type-aware ESLint às vezes resolve como `error`/`any`.
 */
export type UserSettingsWithName = {
  id: string;
  userId: string;
  email: string | null;
  avatarUrl: string | null;
  colorTheme: string | null;
  themeDarkMode: boolean;
  createdAt: Date;
  updatedAt: Date;
  name: string;
};

/**
 * Preferências do usuário ficam na tabela `UserSettings` (1:1 com `User` via `userId`).
 * O `upsert` cria a linha na primeira vez ou atualiza se já existir — não precisa de dois endpoints.
 * O nome exibível fica em `User.name`; pode ser alterado no mesmo body com `name`.
 */
@Injectable()
export class ConfigUserService {
  constructor(private prisma: PrismaService) {}

  async upsert(body: UpsertUserSettingsDto): Promise<UserSettingsWithName> {
    // Garante que o usuário existe antes de gravar `userId` em UserSettings.
    // Esse `userId` é uma chave estrangeira (FK): referência obrigatória ao `User.id` no banco.
    // Se o id não existir, o PostgreSQL rejeitaria o insert; aqui devolvemos 404 com mensagem clara.
    const user = await this.prisma.user.findUnique({
      where: { id: body.userId },
    });
    if (!user) {
      throw new NotFoundException(`User ${body.userId} not found`);
    }

    let name = user.name;
    if (body.name !== undefined) {
      const updated = await this.prisma.user.update({
        where: { id: body.userId },
        data: { name: body.name },
      });
      name = updated.name;
    }

    // `create` = primeira vez; `update` = já havia registro para esse userId.
    const settings = await this.prisma.upsertUserSettings({
      where: { userId: body.userId },
      create: {
        userId: body.userId,
        email: body.email,
        avatarUrl: body.uploadAvatar,
        colorTheme: body.colorTheme,
        themeDarkMode: body.themeDarkMode ?? false,
      },
      update: {
        // Campos `undefined` no body são ignorados pelo Prisma (não zeram o valor no banco).
        email: body.email,
        avatarUrl: body.uploadAvatar,
        colorTheme: body.colorTheme,
        themeDarkMode: body.themeDarkMode,
      },
    });

    const result: UserSettingsWithName = {
      id: settings.id,
      userId: settings.userId,
      email: settings.email,
      avatarUrl: settings.avatarUrl,
      colorTheme: settings.colorTheme,
      themeDarkMode: settings.themeDarkMode,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
      name,
    };
    return result;
  }

  async get(userId: string): Promise<UserSettingsWithName> {
    const row = await this.prisma.findUniqueUserSettingsWithUserName(userId);
    if (row) {
      const { user, ...settings } = row;
      return {
        id: settings.id,
        userId: settings.userId,
        email: settings.email,
        avatarUrl: settings.avatarUrl,
        colorTheme: settings.colorTheme,
        themeDarkMode: settings.themeDarkMode,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt,
        name: user.name,
      };
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const now = new Date();
    // Sem linha em UserSettings ainda: resposta só leitura para o front montar o formulário.
    // `id` não persiste até o primeiro PATCH (upsert).
    return {
      id: `pending:${userId}`,
      userId,
      email: null,
      avatarUrl: null,
      colorTheme: null,
      themeDarkMode: false,
      createdAt: now,
      updatedAt: now,
      name: user.name,
    };
  }
}
