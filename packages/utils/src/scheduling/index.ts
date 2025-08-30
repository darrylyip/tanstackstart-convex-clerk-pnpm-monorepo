import type { Schedule, ScheduleStatus } from '../types';

// Schedule utility functions
export const isScheduleActive = (schedule: Schedule): boolean => {
  const now = new Date();
  return (
    schedule.status === 'active' &&
    schedule.startDate <= now &&
    schedule.endDate >= now
  );
};

export const getScheduleStatusColor = (status: ScheduleStatus): string => {
  switch (status) {
    case 'draft':
      return 'gray';
    case 'active':
      return 'green';
    case 'completed':
      return 'blue';
    case 'cancelled':
      return 'red';
    default:
      return 'gray';
  }
};

export const getDurationInHours = (startDate: Date, endDate: Date): number => {
  return Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
};

export const getUpcomingSchedules = (schedules: Schedule[], days: number = 7): Schedule[] => {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);

  return schedules.filter(
    (schedule) =>
      schedule.status === 'active' &&
      schedule.startDate >= now &&
      schedule.startDate <= futureDate
  ).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
};