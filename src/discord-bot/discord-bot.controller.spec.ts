import { Test, TestingModule } from '@nestjs/testing';
import { DiscordBotController } from './discord-bot.controller';
import { DiscordBotService } from './discord-bot.service';

describe('DiscordBot Controller', () => {
  let controller: DiscordBotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscordBotController],
      providers: [DiscordBotService],
    }).compile();

    controller = module.get<DiscordBotController>(DiscordBotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
