import { NewCustomersCard, type INewCustomersCard } from "../models/new-customers-card.model";

export const getNewCustomersCardByDate = async (
  date: Date
): Promise<INewCustomersCard | null> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return NewCustomersCard.findOne({
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });
};

export const getNewCustomersCardByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<INewCustomersCard[]> => {
  return NewCustomersCard.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: 1 });
};

export const createOrUpdateNewCustomersCard = async (
  date: Date,
  data: Partial<INewCustomersCard>
): Promise<INewCustomersCard> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const existing = await NewCustomersCard.findOne({
    date: {
      $gte: startOfDay,
      $lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
    },
  });

  if (existing) {
    Object.assign(existing, data);
    return existing.save();
  }

  return NewCustomersCard.create({
    date: startOfDay,
    ...data,
  });
};

export const deleteNewCustomersCard = async (date: Date): Promise<void> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  await NewCustomersCard.deleteOne({
    date: {
      $gte: startOfDay,
      $lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
    },
  });
};
