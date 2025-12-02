import { Homepage, IHomepage, DateDataEntry } from "../models/homepage.model";
import { AppError } from "../middleware/error.middleware";

/**
 * Get homepage data by username
 */
export const getHomepageByUsername = async (
  username: string
): Promise<IHomepage | null> => {
  return await Homepage.findOne({ username });
};

/**
 * Ensure a default homepage exists in the database
 * This should be called on server startup to guarantee there's always data for /
 */
export const ensureDefaultHomepage = async (): Promise<IHomepage> => {
  let defaultHomepage = await Homepage.findOne({ default: true });

  if (!defaultHomepage) {
    // Check if there are any homepages at all
    const anyHomepage = await Homepage.findOne();
    
    if (anyHomepage) {
      // Mark the first existing homepage as default
      anyHomepage.default = true;
      defaultHomepage = await anyHomepage.save();
    } else {
      // Create a new default homepage
      defaultHomepage = await Homepage.create({
        username: "default",
        default: true,
        top_section_data: {
          "Gross Volume": [],
          "Net Volume": [],
          "New Customers": [],
          "Successful Payments": [],
        },
        "Payment Card": [],
        "Gross Volume Card": [],
        "Net Volume Card": [],
        "Failed Payments Card": [],
        "New Customers Card": [],
        "Top Customers Card": [],
      });
    }
  }

  return defaultHomepage;
};

/**
 * Get the default homepage
 */
export const getDefaultHomepage = async (): Promise<IHomepage | null> => {
  return await Homepage.findOne({ default: true });
};

/**
 * Get homepage data by username or create if doesn't exist
 */
export const getOrCreateHomepage = async (
  username: string
): Promise<IHomepage> => {
  let homepage = await Homepage.findOne({ username });

  if (!homepage) {
    homepage = await Homepage.create({
      username,
      default: false,
      top_section_data: {
        "Gross Volume": [],
        "Net Volume": [],
        "New Customers": [],
        "Successful Payments": [],
      },
      "Payment Card": [],
      "Gross Volume Card": [],
      "Net Volume Card": [],
      "Failed Payments Card": [],
      "New Customers Card": [],
      "Top Customers Card": [],
    });
  }

  return homepage;
};

/**
 * Get specific card data by username, card name, and date
 */
export const getCardDataByDate = async (
  username: string,
  cardName: string,
  date: Date
): Promise<DateDataEntry | null> => {
  const homepage = await getOrCreateHomepage(username);

  // Normalize date to start of day for comparison
  const targetDate = new Date(date);
  targetDate.setUTCHours(0, 0, 0, 0);

  // Handle top_section_data differently
  if (cardName === "top_section_data") {
    // This would need to be handled separately for each metric
    throw new AppError(
      "Use getTopSectionMetricData for top section data",
      400,
      "invalid_request"
    );
  }

  // Get the card array
  const cardArray = (homepage as any)[cardName] as DateDataEntry[];

  if (!cardArray) {
    return null;
  }

  // Find entry matching the date
  const entry = cardArray.find((entry) => {
    const entryDate = new Date(entry.date);
    entryDate.setUTCHours(0, 0, 0, 0);
    return entryDate.getTime() === targetDate.getTime();
  });

  return entry || null;
};

/**
 * Get top section metric data by username, metric name, and date
 */
export const getTopSectionMetricData = async (
  username: string,
  metricName: string,
  date: Date
): Promise<DateDataEntry | null> => {
  const homepage = await getOrCreateHomepage(username);

  const targetDate = new Date(date);
  targetDate.setUTCHours(0, 0, 0, 0);

  const metricArray = homepage.top_section_data[
    metricName as keyof typeof homepage.top_section_data
  ] as DateDataEntry[];

  if (!metricArray) {
    return null;
  }

  const entry = metricArray.find((entry) => {
    const entryDate = new Date(entry.date);
    entryDate.setUTCHours(0, 0, 0, 0);
    return entryDate.getTime() === targetDate.getTime();
  });

  return entry || null;
};

/**
 * Get card data by date range
 */
export const getCardDataByDateRange = async (
  username: string,
  cardName: string,
  startDate: Date,
  endDate: Date
): Promise<DateDataEntry[]> => {
  const homepage = await getOrCreateHomepage(username);

  const start = new Date(startDate);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setUTCHours(23, 59, 59, 999);

  // Handle top_section_data differently
  if (cardName === "top_section_data") {
    throw new AppError(
      "Use getTopSectionMetricDataRange for top section data",
      400,
      "invalid_request"
    );
  }

  const cardArray = (homepage as any)[cardName] as DateDataEntry[];

  if (!cardArray) {
    return [];
  }

  return cardArray.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= start && entryDate <= end;
  });
};

/**
 * Get top section metric data by date range
 */
export const getTopSectionMetricDataRange = async (
  username: string,
  metricName: string,
  startDate: Date,
  endDate: Date
): Promise<DateDataEntry[]> => {
  const homepage = await getOrCreateHomepage(username);

  const start = new Date(startDate);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setUTCHours(23, 59, 59, 999);

  const metricArray = homepage.top_section_data[
    metricName as keyof typeof homepage.top_section_data
  ] as DateDataEntry[];

  if (!metricArray) {
    return [];
  }

  return metricArray.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= start && entryDate <= end;
  });
};

/**
 * Create or update card data
 */
export const createOrUpdateCardData = async (
  username: string,
  cardName: string,
  date: Date,
  data: any,
  updatedBy?: string
): Promise<IHomepage> => {
  const homepage = await getOrCreateHomepage(username);

  const targetDate = new Date(date);
  targetDate.setUTCHours(0, 0, 0, 0);

  // Handle top_section_data differently
  if (cardName === "top_section_data") {
    throw new AppError(
      "Use createOrUpdateTopSectionMetricData for top section data",
      400,
      "invalid_request"
    );
  }

  const cardArray = (homepage as any)[cardName] as DateDataEntry[];

  if (!cardArray) {
    throw new AppError(`Card ${cardName} not found`, 404, "not_found");
  }

  // Find existing entry
  const existingIndex = cardArray.findIndex((entry) => {
    const entryDate = new Date(entry.date);
    entryDate.setUTCHours(0, 0, 0, 0);
    return entryDate.getTime() === targetDate.getTime();
  });

  const newEntry: DateDataEntry = {
    date: targetDate,
    data,
  };

  if (existingIndex >= 0) {
    // Update existing entry
    cardArray[existingIndex] = newEntry;
  } else {
    // Add new entry
    cardArray.push(newEntry);
  }

  if (updatedBy) {
    homepage.updatedBy = updatedBy;
  }

  return await homepage.save();
};

/**
 * Create or update top section metric data
 */
export const createOrUpdateTopSectionMetricData = async (
  username: string,
  metricName: string,
  date: Date,
  data: any,
  updatedBy?: string
): Promise<IHomepage> => {
  const homepage = await getOrCreateHomepage(username);

  const targetDate = new Date(date);
  targetDate.setUTCHours(0, 0, 0, 0);

  const metricArray = homepage.top_section_data[
    metricName as keyof typeof homepage.top_section_data
  ] as DateDataEntry[];

  if (!metricArray) {
    throw new AppError(`Metric ${metricName} not found`, 404, "not_found");
  }

  // Find existing entry
  const existingIndex = metricArray.findIndex((entry) => {
    const entryDate = new Date(entry.date);
    entryDate.setUTCHours(0, 0, 0, 0);
    return entryDate.getTime() === targetDate.getTime();
  });

  const newEntry: DateDataEntry = {
    date: targetDate,
    data,
  };

  if (existingIndex >= 0) {
    // Update existing entry
    metricArray[existingIndex] = newEntry;
  } else {
    // Add new entry
    metricArray.push(newEntry);
  }

  if (updatedBy) {
    homepage.updatedBy = updatedBy;
  }

  return await homepage.save();
};

/**
 * Delete card data by date
 */
export const deleteCardData = async (
  username: string,
  cardName: string,
  date: Date
): Promise<void> => {
  const homepage = await Homepage.findOne({ username });

  if (!homepage) {
    throw new AppError("Homepage not found", 404, "not_found");
  }

  const targetDate = new Date(date);
  targetDate.setUTCHours(0, 0, 0, 0);

  // Handle top_section_data differently
  if (cardName === "top_section_data") {
    throw new AppError(
      "Use deleteTopSectionMetricData for top section data",
      400,
      "invalid_request"
    );
  }

  const cardArray = (homepage as any)[cardName] as DateDataEntry[];

  if (!cardArray) {
    return;
  }

  // Remove entry matching the date
  const filteredArray = cardArray.filter((entry) => {
    const entryDate = new Date(entry.date);
    entryDate.setUTCHours(0, 0, 0, 0);
    return entryDate.getTime() !== targetDate.getTime();
  });

  (homepage as any)[cardName] = filteredArray;
  await homepage.save();
};

/**
 * Delete top section metric data by date
 */
export const deleteTopSectionMetricData = async (
  username: string,
  metricName: string,
  date: Date
): Promise<void> => {
  const homepage = await Homepage.findOne({ username });

  if (!homepage) {
    throw new AppError("Homepage not found", 404, "not_found");
  }

  const targetDate = new Date(date);
  targetDate.setUTCHours(0, 0, 0, 0);

  const metricArray = homepage.top_section_data[
    metricName as keyof typeof homepage.top_section_data
  ] as DateDataEntry[];

  if (!metricArray) {
    return;
  }

  // Remove entry matching the date
  const filteredArray = metricArray.filter((entry) => {
    const entryDate = new Date(entry.date);
    entryDate.setUTCHours(0, 0, 0, 0);
    return entryDate.getTime() !== targetDate.getTime();
  });

  (homepage.top_section_data as any)[metricName] = filteredArray;
  await homepage.save();
};

/**
 * Get all homepages
 */
export const getAllHomepages = async (): Promise<IHomepage[]> => {
  return await Homepage.find().sort({ username: 1 });
};

/**
 * Set a homepage as default (and unset others)
 */
export const setDefaultHomepage = async (username: string): Promise<IHomepage> => {
  // First, unset all other defaults
  await Homepage.updateMany({ default: true }, { $set: { default: false } });
  
  // Set the specified homepage as default
  const homepage = await Homepage.findOne({ username });
  if (!homepage) {
    throw new AppError("Homepage not found", 404, "not_found");
  }
  
  homepage.default = true;
  return await homepage.save();
};

/**
 * Delete entire homepage by username
 * Cannot delete if it's the default homepage
 */
export const deleteHomepage = async (username: string): Promise<void> => {
  const homepage = await Homepage.findOne({ username });
  if (!homepage) {
    throw new AppError("Homepage not found", 404, "not_found");
  }
  
  if (homepage.default) {
    throw new AppError("Cannot delete the default homepage", 400, "invalid_request");
  }
  
  await Homepage.deleteOne({ username });
};
