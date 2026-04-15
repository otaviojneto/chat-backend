import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ConfigUserService,
  type UserSettingsWithName,
} from './config-user.service';
import type { UpsertUserSettingsBody } from './dto/upsert-user-settings.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUserPayload } from 'src/auth/decorators/current-user.decorator';

@Controller('config-user')
export class ConfigUserController {
  constructor(private configUserService: ConfigUserService) {}

  @Patch()
  @UseGuards(AuthGuard('jwt'))
  upsert(
    @CurrentUser() user: AuthUserPayload,
    @Body() body: UpsertUserSettingsBody,
  ): Promise<UserSettingsWithName> {
    return this.configUserService.upsert(user.userId, body);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMe(@CurrentUser() user: AuthUserPayload): Promise<UserSettingsWithName> {
    return this.configUserService.get(user.userId);
  }
}
