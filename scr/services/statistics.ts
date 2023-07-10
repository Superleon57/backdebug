import dayjs from 'dayjs';
import * as MeiliSearch from 'src/services/meilisearch';

import * as statisticsRepository from 'src/repositories/statistics';

export const getDailyIncome = async ({ shopId }) => {
  const start = dayjs().startOf('day').toDate();
  const end = dayjs().endOf('day').toDate();

  return await statisticsRepository.incomeByDate({ shopId, start, end });
};

export const getMonthlyIncome = async ({ shopId }) => {
  const start = dayjs().startOf('month').toDate();
  const end = dayjs().endOf('month').toDate();

  return await statisticsRepository.incomeByDate({ shopId, start, end });
};

export const getDailySold = async ({ shopId }) => {
  const start = dayjs().startOf('day').toDate();
  const end = dayjs().endOf('day').toDate();

  return await statisticsRepository.soldByDate({ shopId, start, end });
};

export const getMonthlySold = async ({ shopId }) => {
  const start = dayjs().startOf('month').toDate();
  const end = dayjs().endOf('month').toDate();

  return await statisticsRepository.soldByDate({ shopId, start, end });
};

const getSalesByDay = sales => {
  const salesByDate = [];

  sales.forEach(sale => {
    const date = dayjs(sale.creationDate.toDate()).format('YYYY-MM-DD');
    const saleByDate = () =>
      salesByDate.find(s => {
        return s.date === date;
      });

    if (!saleByDate()) {
      salesByDate.push({ date, total: 0 });
    }
    const currentSale = saleByDate();

    currentSale.total += sale.price;
  });

  return salesByDate;
};
// TODO : Refactor this function
export const countNewCustomers = async ({ shopId }) => {
  const currentDate = dayjs();
  const thirtyDaysAgo = currentDate.subtract(30, 'day');

  const ordersSearchResult = await MeiliSearch.ordersIndex().search('', {
    filter: [`creationDate._seconds > ${thirtyDaysAgo.unix()}`, `shopId = ${shopId}`],
    limit: 0,
    facets: ['userId'],
  });
  const usersIds = ordersSearchResult?.facetDistribution?.userId ?? {};
  const count = Object.keys(usersIds).length;

  return count;
};

export const getStatistics = async ({ shopId }) => {
  const sales = await getMonthlySold({ shopId });
  const salesByDate = getSalesByDay(sales);
  const numberOfSales = sales.length;
  const newCustomers = await countNewCustomers({ shopId });

  return { salesByDate, numberOfSales, newCustomers };
};
