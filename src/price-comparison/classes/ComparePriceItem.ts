import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsString,
} from 'class-validator';

export class ComparePriceItem {
  @IsNumber()
  id: number;
  @IsNumber()
  @IsArray()
  prices: PriceItem[];
  @IsString()
  title: string;
  @IsString()
  imgUrl: string;
  @IsDate()
  createdAt: Date;
  @IsBoolean()
  available: boolean;
}

export class PriceItem {
  @IsNumber()
  price: number;
  @IsDate()
  date: Date;
}
