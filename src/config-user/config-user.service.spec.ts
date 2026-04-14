import { Test, TestingModule } from '@nestjs/testing';
import { ConfigUserService } from './config-user.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('ConfigUserService', () => {
  let service: ConfigUserService;

  beforeEach(async () => {
    const mockPrisma = {
      user: { findUnique: jest.fn() },
      upsertUserSettings: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigUserService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ConfigUserService>(ConfigUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
