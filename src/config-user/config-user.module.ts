import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigUserController } from './config-user.controller';
import { ConfigUserService } from './config-user.service';

@Module({
  imports: [AuthModule],
  controllers: [ConfigUserController],
  providers: [ConfigUserService],
})
export class ConfigUserModule {}
