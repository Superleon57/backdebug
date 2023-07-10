import moment from 'moment';
import { UsersOrders } from 'src/entities/order';

export const calculateReward = (distance: number) => {
  const metersToKilometers = distance / 1000;

  const baseReward = 2.85;
  const rewardPerKilometer = 0.82;
  const reward = baseReward + metersToKilometers * rewardPerKilometer;

  return Number(reward.toFixed(2));
};

type Stats = {
  totalOrders: number;
  totalRewards: number;
  averageRewards: number;
};
export interface StatsByDay {
  [day: string]: Stats;
}

export const calculateStats = (orders: UsersOrders[]): StatsByDay => {
  const statsByDay: StatsByDay = {};

  orders.forEach(order => {
    const { creationDate, reward } = order;

    if (!reward) return;

    const date = moment(creationDate.toDate()).format('YYYY-MM-DD');

    if (!statsByDay[date]) {
      statsByDay[date] = {
        totalOrders: 0,
        totalRewards: 0,
        averageRewards: 0,
      };
    }

    statsByDay[date].totalOrders++;
    statsByDay[date].totalRewards = (statsByDay[date].totalRewards * 100 + reward * 100) / 100;
    statsByDay[date].averageRewards = statsByDay[date].totalRewards / statsByDay[date].totalOrders;
  });

  return statsByDay;
};
