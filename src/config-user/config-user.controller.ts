import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import {
  ConfigUserService,
  type UserSettingsWithName,
} from './config-user.service';
import type { UpsertUserSettingsDto } from './dto/upsert-user-settings.dto';

@Controller('config-user')
export class ConfigUserController {
  constructor(private configUserService: ConfigUserService) {}

  @Patch()
  upsert(@Body() body: UpsertUserSettingsDto): Promise<UserSettingsWithName> {
    return this.configUserService.upsert(body);
  }

  @Get(':id')
  get(@Param('id') id: string): Promise<UserSettingsWithName> {
    return this.configUserService.get(id);
  }
}
