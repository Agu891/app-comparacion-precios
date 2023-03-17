import axios from 'axios';
import { ComparePriceItem, PriceItem } from '../classes/ComparePriceItem';
import { ProductsInfoDto } from '../dtos/products.dto';

const weekTimeMin = 10080;
const alertPercentageThreshold = 15;
const URL_W_PAGENUMBER = (pageNumber) =>
  `https://www.bodegasbianchi.com.ar/products.json?page=${pageNumber}`;
const LOG_TIME_ELAPSED_MESSAGE = (description, end, start) =>
  `The process ${description} took ${end - start} seconds`;
const LAST_WEEK_AVERAGE_MESSAGE = (currentDbItemTitle, lastWeekAverage) =>
  `El precio promedio de la ultima semana del producto ${currentDbItemTitle} es ${lastWeekAverage}`;
const HISTORICAL_PRICE_MESSAGE = (currentDbItemTitle, minimumHistorical) =>
  `El precio historico minimo de ${currentDbItemTitle} es de ${minimumHistorical}`;
const LESS_THAN_HISTORICAL_MESSAGE = (latestPrice) =>
  `El precio minimo historico del producto a bajado a ${latestPrice}`;
const DISCOUNT_PERCENTAGE_MESSAGE = (
  currentDbItemTitle,
  calculatedPercentage
) =>
  `El porcentaje de descuento de ${currentDbItemTitle} es de ${calculatedPercentage}%`;
const ALERT_PERCENTAGE_THRESHOLD_MESSAGE = (
  currentDbItemTitle,
  alertPercentageThreshold
) =>
  `El descuento de ${currentDbItemTitle} es mayor a ${alertPercentageThreshold}%`;

export function buildItem(
  variant,
  productMainTitle: string,
  productImage: string
): ComparePriceItem {
  const pricesArray: PriceItem[] = [];
  const newItem = new ComparePriceItem();

  pricesArray.push({ price: variant.price, date: new Date() });

  newItem.title = `${productMainTitle} ${variant.title}`;
  newItem.id = variant.id;
  newItem.prices = pricesArray;
  newItem.imgUrl = productImage;
  newItem.createdAt = variant.created_at;
  newItem.available = variant.available;

  return newItem;
}

export function calculatePercentageDiff(
  latestPrice: number,
  previousPrice: number
) {
  const priceDiff = previousPrice - latestPrice;
  const pricePercentage = Math.ceil((priceDiff * 100) / previousPrice);

  return pricePercentage;
}

export function calculateAverage(pricesArray: PriceItem[]) {
  let priceSum = 0;

  for (const price of pricesArray) {
    priceSum += price.price;
  }
  let averagePrice = priceSum / pricesArray.length;

  return averagePrice;
}

export async function getApiData(
  pageNumber: number
): Promise<ProductsInfoDto[]> {
  const response = await axios.get(URL_W_PAGENUMBER(pageNumber));

  return response.data.products;
}

export function discountAlerts(
  currentDbItem: ComparePriceItem,
  latestPrice: number
) {
  const averagePrice = calculateAverage(currentDbItem.prices);

  if (currentDbItem.prices.length > 1 && latestPrice < averagePrice) {
    const calculatedPercentage = calculatePercentageDiff(
      latestPrice,
      averagePrice
    );

    console.log(
      DISCOUNT_PERCENTAGE_MESSAGE(currentDbItem.title, calculatedPercentage)
    );

    if (calculatedPercentage >= alertPercentageThreshold) {
      console.log(
        ALERT_PERCENTAGE_THRESHOLD_MESSAGE(
          currentDbItem.title,
          alertPercentageThreshold
        )
      );
    }
  }
}

export function historicalMinimum(
  currentDbItem: ComparePriceItem,
  latestPrice: number
) {
  const pricesArray = [];

  for (const price of currentDbItem.prices) {
    pricesArray.push(price.price);
  }

  const minimumHistorical = Math.min(...pricesArray);

  console.log(HISTORICAL_PRICE_MESSAGE(currentDbItem.title, minimumHistorical));

  if (latestPrice < minimumHistorical) {
    console.log(LESS_THAN_HISTORICAL_MESSAGE(latestPrice));
    return true;
  }
}

export function lastWeekAveragePrice(
  currentDbItem: ComparePriceItem,
  currentDate: number
) {
  let weekPricesTotal = 0;
  let count = 0;

  for (const price of currentDbItem.prices) {
    let priceDateMin = price.date.getMinutes();
    let diffDates = currentDate - priceDateMin;

    if (diffDates < weekTimeMin) {
      weekPricesTotal += price.price;
      count += 1;
    }
  }

  const lastWeekAverage = weekPricesTotal / count;

  console.log(LAST_WEEK_AVERAGE_MESSAGE(currentDbItem.title, lastWeekAverage));
}

export async function executeAndLog(functionToMeasure, description) {
  const start = Date.now() / 1000;
  await functionToMeasure;
  const end = Date.now() / 1000;

  console.log(LOG_TIME_ELAPSED_MESSAGE(description, end, start));
}

export function minutesToCronExpression(minutes) {
  if (minutes < 1 || minutes > 59) {
    throw new Error('Invalid number of minutes');
  }

  return `0 */${minutes} * * * *`;
}
