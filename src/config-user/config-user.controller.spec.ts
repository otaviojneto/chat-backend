import { Test, TestingModule } from '@nestjs/testing';
import { ConfigUserController } from './config-user.controller';
import { ConfigUserService } from './config-user.service';

describe('ConfigUserController', () => {
  let controller: ConfigUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfigUserController],
      providers: [
        {
          provide: ConfigUserService,
          useValue: { upsert: jest.fn(), get: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ConfigUserController>(ConfigUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
