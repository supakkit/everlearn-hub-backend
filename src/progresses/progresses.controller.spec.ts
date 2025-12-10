import { Test, TestingModule } from '@nestjs/testing';
import { ProgressesController } from './progresses.controller';

describe('ProgressesController', () => {
  let controller: ProgressesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressesController],
    }).compile();

    controller = module.get<ProgressesController>(ProgressesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
