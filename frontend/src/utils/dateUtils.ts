/**
 * Get the start of today (00:00:00)
 */
export const getToday = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/**
 * Get the start of yesterday (00:00:00)
 */
export const getYesterday = (): Date => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  return yesterday;
};

/**
 * Get the start of last week (7 days ago, 00:00:00)
 */
export const getLastWeek = (): Date => {
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  lastWeek.setHours(0, 0, 0, 0);
  return lastWeek;
};

/**
 * Get the start of last month (30 days ago, 00:00:00)
 */
export const getLastMonth = (): Date => {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  lastMonth.setHours(0, 0, 0, 0);
  return lastMonth;
};

/**
 * Get the earliest possible date (represents the beginning)
 */
export const getBeginning = (): Date => {
  return new Date(0); // Unix epoch
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
  const today = getToday();
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate.getTime() === today.getTime();
};

/**
 * Check if a date is yesterday
 */
export const isYesterday = (date: Date): boolean => {
  const yesterday = getYesterday();
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate.getTime() === yesterday.getTime();
};

/**
 * Format date for display (e.g., "Today", "Yesterday", or full date)
 */
export const formatDateDivider = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
};

/**
 * Get the target date based on jump option
 */
export const getTargetDate = (
  option: 'today' | 'yesterday' | 'lastWeek' | 'lastMonth' | 'beginning' | 'custom',
  customDate?: Date
): Date => {
  switch (option) {
    case 'today':
      return getToday();
    case 'yesterday':
      return getYesterday();
    case 'lastWeek':
      return getLastWeek();
    case 'lastMonth':
      return getLastMonth();
    case 'beginning':
      return getBeginning();
    case 'custom':
      return customDate || getToday();
    default:
      return getToday();
  }
};
