import { NetVolumeCard, type INetVolumeCard } from "../models/net-volume-card.model";

export const getNetVolumeCardByDate = async (
  date: Date
): Promise<INetVolumeCard | null> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return NetVolumeCard.findOne({
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });
};

export const getNetVolumeCardByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<INetVolumeCard[]> => {
  return NetVolumeCard.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: 1 });
};

export const createOrUpdateNetVolumeCard = async (
  date: Date,
  data: Partial<INetVolumeCard>
): Promise<INetVolumeCard> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const existing = await NetVolumeCard.findOne({
    date: {
      $gte: startOfDay,
      $lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
    },
  });

  if (existing) {
    Object.assign(existing, data);
    return existing.save();
  }

  return NetVolumeCard.create({
    date: startOfDay,
    ...data,
  });
};

export const deleteNetVolumeCard = async (date: Date): Promise<void> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  await NetVolumeCard.deleteOne({
    date: {
      $gte: startOfDay,
      $lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
    },
  });
};
