import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class VariantsDto {
  @IsNumber()
  price: number;
  @IsBoolean()
  available: boolean;
  @IsNumber()
  id: number;
  @IsDate()
  created_at: Date;
  @IsString()
  title: string;
}

export class ImagesDto {
  @IsString()
  src: string;
}

export class ProductsInfoDto {
  @IsString()
  title: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantsDto)
  variants: VariantsDto[];
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImagesDto)
  images: ImagesDto[];
  @IsString()
  tags: string;
}

export class ProductsDto {
  @Type(() => ProductsInfoDto)
  products: ProductsInfoDto[];
}
