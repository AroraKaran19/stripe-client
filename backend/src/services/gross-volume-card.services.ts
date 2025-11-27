import { GrossVolumeCard, type IGrossVolumeCard } from "../models/gross-volume-card.model";

export const getGrossVolumeCardByDate = async (
  date: Date
): Promise<IGrossVolumeCard | null> => {
  // Create UTC start and end of day
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
  // Create UTC start of day for the given date
  const startOfDay = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0, 0
  ));

  const result = await GrossVolumeCard.findOneAndUpdate(
    {
      date: {
        $gte: startOfDay,
        $lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
      },
    },
    {
      $set: {
        date: startOfDay,
        ...data,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );

  return result!;
};

export const deleteGrossVolumeCard = async (date: Date): Promise<void> => {
  // Create UTC start of day
  const startOfDay = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0, 0
  ));

  await GrossVolumeCard.deleteOne({
    date: {
      $gte: startOfDay,
      $lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
    },
  });
};
