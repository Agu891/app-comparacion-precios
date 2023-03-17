import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ItemsDocument = Items & Document;

@Schema()
export class PriceItem {
  @Prop()
  price: number;
  @Prop({ default: Date.now })
  date: Date;
}

const PriceItemSchema = SchemaFactory.createForClass(PriceItem);

@Schema()
export class Items {
  @Prop()
  id: number;
  @Prop({ type: [PriceItemSchema] })
  prices: PriceItem[];
  @Prop()
  title: string;
  @Prop()
  imgUrl: string;
  @Prop({ default: Date.now })
  createdAt: Date;
  @Prop({ default: false })
  available: boolean;
}

export const ItemsSchema = SchemaFactory.createForClass(Items);
