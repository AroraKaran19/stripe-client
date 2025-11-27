import { FailedPaymentsCard, type IFailedPaymentsCard } from "../models/failed-payments-card.model";

export const getFailedPaymentsCardByDate = async (
  date: Date
): Promise<IFailedPaymentsCard | null> => {
  const startOfDay = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0, 0
  ));
  const endOfDay = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    23, 59, 59, 999
  ));

  return FailedPaymentsCard.findOne({
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });
};

export const getFailedPaymentsCardByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<IFailedPaymentsCard[]> => {
  return FailedPaymentsCard.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: 1 });
};

export const createOrUpdateFailedPaymentsCard = async (
  date: Date,
  data: Partial<IFailedPaymentsCard>
): Promise<IFailedPaymentsCard> => {
  const startOfDay = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0, 0
  ));

  const existing = await FailedPaymentsCard.findOne({
    date: {
      $gte: startOfDay,
      $lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
    },
  });

  if (existing) {
    Object.assign(existing, data);
    return existing.save();
  }

  return FailedPaymentsCard.create({
    date: startOfDay,
    ...data,
  });
};

export const deleteFailedPaymentsCard = async (date: Date): Promise<void> => {
  const startOfDay = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0, 0
  ));

  await FailedPaymentsCard.deleteOne({
    date: {
      $gte: startOfDay,
      $lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
    },
  });
};
