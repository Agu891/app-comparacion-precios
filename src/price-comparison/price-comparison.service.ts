import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Items, ItemsDocument } from './schemas/items.schema';
import {
  buildItem,
  discountAlerts,
  getApiData,
  historicalMinimum,
  lastWeekAveragePrice,
  minutesToCronExpression,
} from './utils/utils';
import { Cron } from '@nestjs/schedule';
import * as dotenv from 'dotenv';
dotenv.config();

const currentDateInMin = new Date().getMinutes();
const updateTimeInMin = 480;
const ARMA_TU_CAJA_TAG = 'arma-tu-caja';

const NO_DISPONIBLE_MESSAGE = (title, variantTitle) =>
  `El producto ${title} en su version de ${variantTitle} no esta disponible`;
const AGREGAR_PRODUCTO_MESSAGE = (title) =>
  `Se ha agregado el producto ${title} a la lista`;
const PRECIO_ACTUALIZADO_MESSAGE = (productTitle) =>
  `Precio del producto ${productTitle}  actualizado`;
const CACHED_DB_MESSAGE = 'DB CACHEADA';
let mappedDbItems;

@Injectable()
export class PriceComparisonService {
  constructor(
    @InjectModel(Items.name) private itemsRepo: Model<ItemsDocument>
  ) {}
  @Cron(minutesToCronExpression(process.env.TIME_IN_MIN))
  async updateProductStatus() {
    let stopCount = false;
    let pagesNum = 1;
    if (!mappedDbItems) {
      const dbItems = await this.itemsRepo.find({}, 'id prices title').exec();
      mappedDbItems = new Map(dbItems.map((entry) => [entry.id, entry]));
      console.log(CACHED_DB_MESSAGE);
    }

    do {
      const products = await getApiData(pagesNum++);
      stopCount = products.length === 0;

      for (const product of products) {
        const productMainTitle = product.title;
        const productImage = product.images[0].src;

        if (product.tags[0] === ARMA_TU_CAJA_TAG) {
          continue;
        }

        for (const variant of product.variants) {
          const isInDb = mappedDbItems.has(variant.id);
          const latestPrice = variant.price;
          const currentDbItem = mappedDbItems.get(variant.id);

          if (!isInDb) {
            const itemBuilt = buildItem(
              variant,
              productMainTitle,
              productImage
            );

            const itemAddedToDb = await this.itemsRepo.create(itemBuilt);
            mappedDbItems.set(itemAddedToDb.id, itemAddedToDb);
            console.log(AGREGAR_PRODUCTO_MESSAGE(itemBuilt.title));
          } else {
            const latestPriceDateInMin =
              currentDbItem.prices[
                currentDbItem.prices.length - 1
              ].date.getMinutes();

            const diffDatesInMin = currentDateInMin - latestPriceDateInMin;

            await this.itemsRepo.findByIdAndUpdate(currentDbItem._id, {
              $set: {
                available: variant.available,
              },
            });

            if (!variant.available) {
              console.log(NO_DISPONIBLE_MESSAGE(product.title, variant.title));
            }

            const minimumPrice = historicalMinimum(currentDbItem, latestPrice);
            discountAlerts(currentDbItem, latestPrice);

            if (diffDatesInMin > updateTimeInMin || minimumPrice) {
              await this.itemsRepo.findByIdAndUpdate(currentDbItem._id, {
                $push: { prices: { price: latestPrice } },
              });

              console.log(PRECIO_ACTUALIZADO_MESSAGE(product.title));

              currentDbItem.prices.push({
                price: latestPrice,
                date: new Date(),
              });

              lastWeekAveragePrice(currentDbItem, currentDateInMin);
            }
          }
        }
      }
    } while (!stopCount);
  }
}
