/**
 * 时间间隔转换工具
 * 统一存储单位：分钟
 */

export type TimeUnit = 'minutes' | 'hours' | 'weeks';

export interface TimeUnitValue {
  timeUnit: TimeUnit;
  value: number;
}

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_WEEK = 60 * 24 * 7; // 10080

/**
 * 将分钟数转换为合适的时间单位和数值（用于表单显示）
 * @param minutes 分钟数
 * @returns { timeUnit, value }
 */
export function minutesToTimeUnit(minutes: number | undefined | null): TimeUnitValue {
  if (!minutes && minutes !== 0) {
    return { timeUnit: 'hours', value: 1 };
  }

  // 如果是周的整数倍
  if (minutes >= MINUTES_PER_WEEK && minutes % MINUTES_PER_WEEK === 0) {
    return { timeUnit: 'weeks', value: minutes / MINUTES_PER_WEEK };
  }

  // 如果是小时的整数倍
  if (minutes >= MINUTES_PER_HOUR && minutes % MINUTES_PER_HOUR === 0) {
    return { timeUnit: 'hours', value: minutes / MINUTES_PER_HOUR };
  }

  // 默认分钟
  return { timeUnit: 'minutes', value: minutes };
}

/**
 * 将时间单位和数值转换为分钟数（用于表单提交）
 * @param value 数值
 * @param timeUnit 时间单位
 * @returns 分钟数
 */
export function timeUnitToMinutes(value: number, timeUnit: TimeUnit): number {
  switch (timeUnit) {
    case 'weeks':
      return value * MINUTES_PER_WEEK;
    case 'hours':
      return value * MINUTES_PER_HOUR;
    case 'minutes':
    default:
      return value;
  }
}
