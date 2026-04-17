import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { RoomService } from 'src/room/room.service';
import { DefaultEventsMap, Server, Socket } from 'socket.io';

type ChatSocketData = { userId?: string };

type ChatSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  ChatSocketData
>;

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection {
  constructor(
    private readonly jwtService: JwtService,
    private readonly roomService: RoomService,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: ChatSocket) {
    const rawToken =
      typeof client.handshake.auth?.token === 'string'
        ? client.handshake.auth.token
        : typeof client.handshake.query?.token === 'string'
          ? client.handshake.query.token
          : undefined;

    if (!rawToken) {
      client.disconnect();
      return;
    }

    const token = rawToken.replace(/^Bearer\s+/i, '');

    try {
      const payload = this.jwtService.verify<{ sub: string }>(token);
      client.data.userId = payload.sub;
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: ChatSocket,
  ) {
    const userId = client.data.userId;
    if (!userId) {
      return { ok: false, error: 'Unauthorized' };
    }

    await this.roomService.assertUserCanAccessRoom(userId, roomId);
    await client.join(roomId);
    return { ok: true };
  }

  sendMessage(message: {
    id: string;
    content: string;
    roomId: string;
    createdAt: Date;
    user: { name: string };
  }) {
    this.server.to(message.roomId).emit('message', message);
  }
}
