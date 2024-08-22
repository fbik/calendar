import {CustomDate, DayOfWeek, DayType} from "../types";

interface ChangedDays {
    holidays: CustomDate[],
    workingWeekends: CustomDate[]
}

interface WorkingDays {
    fullWorkDays: CustomDate[],
    shortWorkDays: CustomDate[],
}

export function checkDayType(date: CustomDate, changedDays: ChangedDays): DayType {
    const {fullWorkDays, shortWorkDays} = calculateWorkingDays(date.year, date.month, changedDays)

    if (fullWorkDays.find(({
                               day,
                               month,
                               year
                           }) => day === date.day && month === date.month && year === date.year) !== undefined) {
        return 'full-work-day'
    }

    if (shortWorkDays.find(({
                                day,
                                month,
                                year
                            }) => day === date.day && month === date.month && year === date.year) !== undefined) {
        return 'short-work-day'
    }

    return 'holiday'
}


export function calculateWorkingHours(year: number, month: number, changedDays: ChangedDays): number {
    const {fullWorkDays, shortWorkDays} = calculateWorkingDays(year, month, changedDays)
    return fullWorkDays.length * 8 + shortWorkDays.length * 7
}

export function calculateWorkingDays(year: number, month: number, changedDays: ChangedDays): WorkingDays {
    const numberOfDaysInMonth = new Date(year, month, 0).getDate()

    const potentialWorkDays = Array(numberOfDaysInMonth)
        .fill(0)
        .map((_, index) => index + 1)
        .map(day => ({day, month, year}))
        .filter(({day, month, year}) => !isWeekend(new Date(year, month - 1, day).getDay()))
        .filter(date => changedDays.holidays.find(holiday => holiday.day === date.day && holiday.month === date.month && holiday.year === date.year) === undefined)

    const nextOne = nextMonth({year, month, day: 0})
    const numberOfDaysInNextMonth = new Date(nextOne.year, nextOne.month, 0).getDate()

    const potentialWorkDaysInNextMonth = Array(numberOfDaysInNextMonth)
        .fill(0)
        .map((_, index) => index + 1)
        .map(day => ({day, month: nextOne.month, year: nextOne.year}))
        .filter(({day, month, year}) => !isWeekend(new Date(year, month - 1, day).getDay()))
        .filter(date => changedDays.holidays.find(holiday => holiday.day === date.day && holiday.month === date.month && holiday.year === date.year) === undefined)

    const allWorkDays = [
        ...potentialWorkDays,
        ...potentialWorkDaysInNextMonth,
        ...changedDays.workingWeekends.filter(date => year === date.year && month === date.month)
    ]

    const allSortedWorkDays = sortCustomDates(allWorkDays)

    const shortWorkDays = changedDays
        .holidays
        .map(holiday => findClosestBefore(holiday, allSortedWorkDays))
        .filter(shortDay => shortDay !== undefined)
        .filter(date => date.month === month && date.year === year)
    console.warn('shortWorkDays', shortWorkDays)


    const fullWorkDays = allWorkDays
        .filter(date => shortWorkDays.find(short => short.day === date.day && short.month === date.month && short.year === date.year) === undefined)
        .filter(date => date.month === month && date.year === year)

    console.warn('fullWorkDays', fullWorkDays)

    return {shortWorkDays, fullWorkDays}
}


function findClosestBefore(date: CustomDate, orderedOthers: CustomDate[]): CustomDate | undefined {
    const daysBeforeHoliday = orderedOthers.filter(({
                                                        month,
                                                        day
                                                    }) => (day <= date.day && month === date.month) || (month < date.month))
    return getLastElement(daysBeforeHoliday)
}

function sortCustomDates(dates: CustomDate[]): CustomDate[] {
    return dates.sort((a, b) => {
        if (a.year !== b.year) {
            return a.year - b.year;
        } else if (a.month !== b.month) {
            return a.month - b.month;
        } else {
            return a.day - b.day;
        }
    });
}

function isWeekend(day: DayOfWeek): boolean {
    return day === DayOfWeek.Saturday || day === DayOfWeek.Sunday;
}

function getLastElement<T>(array: T[]): T | undefined {
    return array.length > 0 ? array[array.length - 1] : undefined;
}


export function nextMonth(date: CustomDate): CustomDate {
    if (date.month === 12) {
        return {year: date.year + 1, month: 1, day: date.day};
    }

    return {...date, month: date.month + 1}
}