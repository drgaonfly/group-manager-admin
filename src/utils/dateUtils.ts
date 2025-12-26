/**
 * 日期时间转换工具
 */
import dayjs, { Dayjs } from 'dayjs';

/**
 * 将日期值转换为 dayjs 对象（用于表单初始化）
 * @param date 日期值（Date | string | undefined）
 * @returns Dayjs | undefined
 */
export function toDayjs(date: Date | string | undefined | null): Dayjs | undefined {
  if (!date) return undefined;
  return dayjs(date);
}

/**
 * 将 dayjs 对象转换为 ISO 字符串（用于表单提交）
 * @param date dayjs 对象或其他日期值
 * @returns ISO 字符串或 undefined
 */
export function toISOString(date: Dayjs | Date | string | undefined | null): string | undefined {
  if (!date) return undefined;
  return dayjs(date).toISOString();
}
