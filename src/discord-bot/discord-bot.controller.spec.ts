import { Test, TestingModule } from '@nestjs/testing';
import { DiscordBotController } from './discord-bot.controller';
import { DiscordBotService } from './discord-bot.service';
import { ConfigModule } from '@nestjs/config';

describe('DiscordBot Controller', () => {
  let controller: DiscordBotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      controllers: [DiscordBotController],
      providers: [DiscordBotService],
    }).compile();

    controller = module.get<DiscordBotController>(DiscordBotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
