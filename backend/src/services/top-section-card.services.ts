import { TopSectionCard, type ITopSectionCard } from "../models/top-section-card.model";

export const getTopSectionCardByDate = async (
  date: Date
): Promise<ITopSectionCard | null> => {
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

  return TopSectionCard.findOne({
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });
};

export const getTopSectionCardByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<ITopSectionCard[]> => {
  return TopSectionCard.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: 1 });
};

export const createOrUpdateTopSectionCard = async (
  date: Date,
  data: Partial<ITopSectionCard>
): Promise<ITopSectionCard> => {
  const startOfDay = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0, 0
  ));

  const existing = await TopSectionCard.findOne({
    date: {
      $gte: startOfDay,
      $lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
    },
  });

  if (existing) {
    Object.assign(existing, data);
    return existing.save();
  }

  return TopSectionCard.create({
    date: startOfDay,
    ...data,
  });
};

export const deleteTopSectionCard = async (date: Date): Promise<void> => {
  const startOfDay = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0, 0
  ));

  await TopSectionCard.deleteOne({
    date: {
      $gte: startOfDay,
      $lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
    },
  });
};
