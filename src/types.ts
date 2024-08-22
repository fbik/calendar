export interface CustomDate {
    year: number
    month: number,
    day: number
}

export type DayType = 'full-work-day' | 'short-work-day' | 'holiday'

export enum DayOfWeek {
    Sunday,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday
}