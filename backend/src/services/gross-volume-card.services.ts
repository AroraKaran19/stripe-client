import { GrossVolumeCard, type IGrossVolumeCard } from "../models/gross-volume-card.model";

export const getGrossVolumeCardByDate = async (
  date: Date
): Promise<IGrossVolumeCard | null> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return GrossVolumeCard.findOne({
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });
};

export const getGrossVolumeCardByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<IGrossVolumeCard[]> => {
  return GrossVolumeCard.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: 1 });
};

export const createOrUpdateGrossVolumeCard = async (
  date: Date,
  data: Partial<IGrossVolumeCard>
): Promise<IGrossVolumeCard> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const existing = await GrossVolumeCard.findOne({
    date: {
      $gte: startOfDay,
      $lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
    },
  });

  if (existing) {
    Object.assign(existing, data);
    return existing.save();
  }

  return GrossVolumeCard.create({
    date: startOfDay,
    ...data,
  });
};

export const deleteGrossVolumeCard = async (date: Date): Promise<void> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  await GrossVolumeCard.deleteOne({
    date: {
      $gte: startOfDay,
      $lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
    },
  });
};
