import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PriceComparisonModule } from './price-comparison/price-comparison.module';
import { ConfigModule } from '@nestjs/config';
import { Database } from './database.provider';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PriceComparisonModule,
    Database,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
