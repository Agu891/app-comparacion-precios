import { Test, TestingModule } from '@nestjs/testing';
import { PriceComparisonService } from './price-comparison.service';

describe('PriceComparisonService', () => {
  let service: PriceComparisonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PriceComparisonService],
    }).compile();

    service = module.get<PriceComparisonService>(PriceComparisonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
