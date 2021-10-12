import { Test, TestingModule } from '@nestjs/testing';
import { GuildPreviewController } from './guild-preview.controller';

describe('GuildPreviewController', () => {
  let controller: GuildPreviewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuildPreviewController],
    }).compile();

    controller = module.get<GuildPreviewController>(GuildPreviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
