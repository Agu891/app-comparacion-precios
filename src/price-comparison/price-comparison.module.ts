import { Module } from '@nestjs/common';
import { Items, ItemsSchema } from './schemas/items.schema';
import { MongooseModule } from '@nestjs/mongoose';

import { PriceComparisonService } from './price-comparison.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Items.name, schema: ItemsSchema }]),
  ],

  providers: [PriceComparisonService],
})
export class PriceComparisonModule {}
