import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PriceComparisonService } from './price-comparison/price-comparison.service';
import { executeAndLog } from './price-comparison/utils/utils';
import * as dotenv from 'dotenv';
dotenv.config();
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const appService = app.get(PriceComparisonService);
  executeAndLog(appService.updateProductStatus(), 'Update product');
}
bootstrap();
