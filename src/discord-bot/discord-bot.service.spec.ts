import { Test, TestingModule } from '@nestjs/testing';
import { DiscordBotService } from './discord-bot.service';
import { ConfigModule } from '@nestjs/config';

describe('DiscordBotService', () => {
  let service: DiscordBotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [DiscordBotService],
    }).compile();

    service = module.get<DiscordBotService>(DiscordBotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
