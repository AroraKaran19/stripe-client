import { PaymentsCard, type IPaymentsCard } from "../models/payments-card.model";

export const getPaymentsCardByDate = async (
  dateStr: string // YYYY-MM-DD format
): Promise<IPaymentsCard | null> => {
  // Parse YYYY-MM-DD string and create UTC date range
  const [year, month, day] = dateStr.split('-').map(Number);
  
  const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
  
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
  dateStr: string, // YYYY-MM-DD format
  data: Partial<IPaymentsCard>
): Promise<IPaymentsCard> => {
  // Parse YYYY-MM-DD string and create UTC date
  const [year, month, day] = dateStr.split('-').map(Number);
  const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  
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

export const deletePaymentsCard = async (dateStr: string): Promise<void> => {
  // Parse YYYY-MM-DD string and create UTC date
  const [year, month, day] = dateStr.split('-').map(Number);
  const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

  await PaymentsCard.deleteOne({
    date: {
      $gte: startOfDay,
      $lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
    },
  });
};
