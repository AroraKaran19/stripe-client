import { PaymentsCard, type IPaymentsCard } from "../models/payments-card.model";

export const getPaymentsCardByDate = async (
  date: Date
): Promise<IPaymentsCard | null> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return PaymentsCard.findOne({
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });
};

export const getPaymentsCardByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<IPaymentsCard[]> => {
  return PaymentsCard.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: 1 });
};

export const createOrUpdatePaymentsCard = async (
  date: Date,
  data: Partial<IPaymentsCard>
): Promise<IPaymentsCard> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const existing = await PaymentsCard.findOne({
    date: {
      $gte: startOfDay,
      $lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
    },
  });

  if (existing) {
    Object.assign(existing, data);
    return existing.save();
  }

  return PaymentsCard.create({
    date: startOfDay,
    ...data,
  });
};

export const deletePaymentsCard = async (date: Date): Promise<void> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  await PaymentsCard.deleteOne({
    date: {
      $gte: startOfDay,
      $lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
    },
  });
};
