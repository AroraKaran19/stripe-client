import { NetVolumeCard, type INetVolumeCard } from "../models/net-volume-card.model";

export const getNetVolumeCardByDate = async (
  date: Date
): Promise<INetVolumeCard | null> => {
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
  // Create UTC start of day for the given date
  const startOfDay = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0, 0
  ));

  const result = await NetVolumeCard.findOneAndUpdate(
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

export const deleteNetVolumeCard = async (date: Date): Promise<void> => {
  // Create UTC start of day
  const startOfDay = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0, 0
  ));

  await NetVolumeCard.deleteOne({
    date: {
      $gte: startOfDay,
      $lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
    },
  });
};
