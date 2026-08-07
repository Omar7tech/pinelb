import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { OpeningHours, Shop } from '@/types/shop';

/** Days in display order (Monday first), and labels indexed by `Date.getDay()`. */
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

/** Minutes since midnight for a `HH:mm` time string. */
function toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + (minutes ?? 0);
}

/**
 * Whether `minutesNow` falls inside a day's opening hours. `fromYesterday`
 * marks hours belonging to the previous day, which can only still be running if
 * they cross midnight.
 */
function isWithinHours(
    hours: OpeningHours | undefined,
    minutesNow: number,
    fromYesterday: boolean,
): boolean {
    if (!hours || hours.isClosed) {
        return false;
    }

    const opensAt = toMinutes(hours.opensAt);
    const closesAt = toMinutes(hours.closesAt);
    // A closing time at or before the opening time means the shop closes the
    // next day (e.g. open 18:00, close 02:00).
    const crossesMidnight = closesAt <= opensAt;

    if (fromYesterday) {
        return crossesMidnight && minutesNow <= closesAt;
    }

    return crossesMidnight
        ? minutesNow >= opensAt
        : minutesNow >= opensAt && minutesNow <= closesAt;
}

/**
 * Whether the shop is open, resolving its status mode. Mirrors the server-side
 * `GeneralSettings::isCurrentlyOpen()` so the automatic schedule can flip over
 * without a page reload. Pass `now` to override the current time.
 */
export function isShopOpen(shop: Shop, now: Date = new Date()): boolean {
    if (shop.statusMode === 'manual') {
        return shop.isManuallyOpen;
    }

    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const byDay = new Map(shop.openingHours.map((hours) => [hours.day, hours]));
    const yesterday = (now.getDay() + 6) % 7;

    return (
        isWithinHours(byDay.get(now.getDay()), minutesNow, false) ||
        isWithinHours(byDay.get(yesterday), minutesNow, true)
    );
}

/** The full weekday name for a `Date.getDay()` index. */
export function dayName(day: number): string {
    return FULL_DAYS[day];
}

/** Format a `HH:mm` time as a friendly 12-hour string, e.g. "9:00 AM". */
export function formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours < 12 ? 'AM' : 'PM';
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;

    return `${hour12}:${String(minutes ?? 0).padStart(2, '0')} ${period}`;
}

/**
 * The next moment the shop opens, scanning today and the week ahead. Returns
 * null in manual mode, or when no day of the schedule is open.
 */
export function nextOpening(shop: Shop, now: Date = new Date()): Date | null {
    if (shop.statusMode !== 'automatic') {
        return null;
    }

    const byDay = new Map(shop.openingHours.map((hours) => [hours.day, hours]));

    for (let ahead = 0; ahead < 8; ahead += 1) {
        const date = new Date(now);
        date.setDate(date.getDate() + ahead);

        const hours = byDay.get(date.getDay());

        if (!hours || hours.isClosed) {
            continue;
        }

        const [openHour, openMinute] = hours.opensAt.split(':').map(Number);
        date.setHours(openHour, openMinute ?? 0, 0, 0);

        if (date.getTime() > now.getTime()) {
            return date;
        }
    }

    return null;
}

/**
 * A sentence for when the shop next opens, e.g. "Opens today at 5:00 PM", or
 * null when there is nothing scheduled to open (or the mode is manual).
 */
export function nextOpeningLabel(
    shop: Shop,
    now: Date = new Date(),
): string | null {
    const target = nextOpening(shop, now);

    if (!target) {
        return null;
    }

    const startOfDay = (date: Date): number =>
        new Date(date).setHours(0, 0, 0, 0);
    const daysAhead = Math.round(
        (startOfDay(target) - startOfDay(now)) / 86_400_000,
    );

    const when =
        daysAhead === 0
            ? 'today'
            : daysAhead === 1
              ? 'tomorrow'
              : `on ${dayName(target.getDay())}`;
    const time = formatTime(
        `${target.getHours()}:${String(target.getMinutes()).padStart(2, '0')}`,
    );

    return `Opens ${when} at ${time}`;
}

/** A row of the weekly schedule, with consecutive same-hours days grouped. */
export type HoursRow = {
    /** e.g. "Mon – Fri" or "Sat". */
    label: string;
    isClosed: boolean;
    opensAt: string;
    closesAt: string;
    /** Whether today falls inside this grouped row. */
    isToday: boolean;
};

/**
 * The weekly opening hours, ordered Monday-first, with consecutive days that
 * share the same hours merged into one range (e.g. "Mon – Fri"). The row
 * covering today is flagged so it can be highlighted.
 */
export function weeklyHours(shop: Shop, now: Date = new Date()): HoursRow[] {
    const byDay = new Map(shop.openingHours.map((hours) => [hours.day, hours]));
    const today = now.getDay();

    const groups: {
        startDay: number;
        endDay: number;
        hours: OpeningHours;
        isToday: boolean;
    }[] = [];

    for (const day of DISPLAY_ORDER) {
        const hours = byDay.get(day);

        if (!hours) {
            continue;
        }

        const last = groups.at(-1);
        const matchesLast =
            last !== undefined &&
            last.hours.isClosed === hours.isClosed &&
            (hours.isClosed ||
                (last.hours.opensAt === hours.opensAt &&
                    last.hours.closesAt === hours.closesAt));

        if (matchesLast) {
            last.endDay = day;
            last.isToday ||= day === today;
        } else {
            groups.push({
                startDay: day,
                endDay: day,
                hours,
                isToday: day === today,
            });
        }
    }

    return groups.map((group) => ({
        label:
            group.startDay === group.endDay
                ? SHORT_DAYS[group.startDay]
                : `${SHORT_DAYS[group.startDay]} – ${SHORT_DAYS[group.endDay]}`,
        isClosed: group.hours.isClosed,
        opensAt: group.hours.opensAt,
        closesAt: group.hours.closesAt,
        isToday: group.isToday,
    }));
}

/** The shared shop settings from the page props. */
export function useShop(): Shop {
    return usePage().props.shop;
}

/**
 * The shop's open/closed state. On the automatic schedule it is re-evaluated
 * every half minute, so a shop that opens or closes while the menu is on screen
 * updates without a reload.
 */
export function useShopOpen(): boolean {
    const shop = useShop();
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        if (shop.statusMode !== 'automatic') {
            return;
        }

        const timer = window.setInterval(() => setNow(new Date()), 30_000);

        return () => window.clearInterval(timer);
    }, [shop.statusMode]);

    return isShopOpen(shop, now);
}
