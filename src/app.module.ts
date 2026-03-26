import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { RoomModule } from './room/room.module';
import { MessageController } from './message/message.controller';
import { MessageService } from './message/message.service';
import { MessageModule } from './message/message.module';
import { ChatGateway } from './chat/chat.gateway';

@Module({
  imports: [PrismaModule, UserModule, RoomModule, MessageModule],
  controllers: [AppController, MessageController],
  providers: [AppService, MessageService, ChatGateway],
})
export class AppModule {}
