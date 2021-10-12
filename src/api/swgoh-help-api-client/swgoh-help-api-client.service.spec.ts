import { Test, TestingModule } from '@nestjs/testing';
import { SwgohHelpApiClientService } from './swgoh-help-api-client.service';

describe('SwgohHelpApiClientService', () => {
  let service: SwgohHelpApiClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwgohHelpApiClientService],
    }).compile();

    service = module.get<SwgohHelpApiClientService>(SwgohHelpApiClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
