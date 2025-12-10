import { format, toZonedTime } from 'date-fns-tz';

const PH_TIMEZONE = 'Asia/Manila';

export function formatToPHTime(date: Date | string): string {
    const dateObj = date instanceof Date ? date : new Date(date);
    const phTime = toZonedTime(dateObj, PH_TIMEZONE);

    return format(phTime, 'MMM dd, yyyy hh:mm a', { timeZone: PH_TIMEZONE });
}

export function formatToPHDate(date: Date | string): string {
    const dateObj = date instanceof Date ? date : new Date(date);
    const phTime = toZonedTime(dateObj, PH_TIMEZONE);

    return format(phTime, 'MMMM dd, yyyy', { timeZone: PH_TIMEZONE });
}

export function formatToPHTimeOnly(date: Date | string): string {
    const dateObj = date instanceof Date ? date : new Date(date);
    const phTime = toZonedTime(dateObj, PH_TIMEZONE);

    return format(phTime, 'hh:mm a', { timeZone: PH_TIMEZONE });
}
