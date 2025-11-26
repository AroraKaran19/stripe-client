import { TopCustomersCard, type ITopCustomersCard } from "../models/top-customers-card.model";

export const getTopCustomersCardByDate = async (
  date: Date
): Promise<ITopCustomersCard | null> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return TopCustomersCard.findOne({
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });
};

export const getTopCustomersCardByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<ITopCustomersCard[]> => {
  return TopCustomersCard.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: 1 });
};

export const createOrUpdateTopCustomersCard = async (
  date: Date,
  data: Partial<ITopCustomersCard>
): Promise<ITopCustomersCard> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const existing = await TopCustomersCard.findOne({
    date: {
      $gte: startOfDay,
      $lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
    },
  });

  if (existing) {
    Object.assign(existing, data);
    return existing.save();
  }

  return TopCustomersCard.create({
    date: startOfDay,
    ...data,
  });
};

export const deleteTopCustomersCard = async (date: Date): Promise<void> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  await TopCustomersCard.deleteOne({
    date: {
      $gte: startOfDay,
      $lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
    },
  });
};
