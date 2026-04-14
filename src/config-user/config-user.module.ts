import { Module } from '@nestjs/common';
import { ConfigUserController } from './config-user.controller';
import { ConfigUserService } from './config-user.service';

@Module({
  controllers: [ConfigUserController],
  providers: [ConfigUserService],
})
export class ConfigUserModule {}
