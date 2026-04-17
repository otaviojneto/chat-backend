import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from 'src/room/room.service';
import { ChatGateway } from './chat.gateway';

describe('ChatGateway', () => {
  let gateway: ChatGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        { provide: JwtService, useValue: { verify: jest.fn() } },
        {
          provide: RoomService,
          useValue: { assertUserCanAccessRoom: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
