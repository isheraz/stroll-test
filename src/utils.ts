import { addDays, differenceInDays } from 'date-fns';

export const getCurrentCycle = (startDate: Date, durationInDays: number): number => {
  const now = new Date();
  const daysDiff = differenceInDays(now, startDate);
  return Math.floor(daysDiff / durationInDays) + 1;
};
