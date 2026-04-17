import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from 'src/chat/chat.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoomService } from 'src/room/room.service';
import { MessageService } from './message.service';

describe('MessageService', () => {
  let service: MessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        { provide: PrismaService, useValue: {} },
        { provide: ChatGateway, useValue: { sendMessage: jest.fn() } },
        {
          provide: RoomService,
          useValue: { assertUserCanAccessRoom: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
