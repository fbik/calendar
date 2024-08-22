import {CustomDate} from "./types";
import {GetResponse, WorkingHoursGetRequest} from "./routes/working-hour";
import fs from 'fs';
import yaml from 'js-yaml';

async function run() {
    // 1 https://www.garant.ru/calendar/buhpravo/2023/
    const workWeekends2023 = [
        {day: 1, month: 1, year: 2023},
        {day: 8, month: 1, year: 2023}
    ]

    for (const date of workWeekends2023) {
        await addWorkWeekend(date)
    }

    const holidays2023 = [
        {day: 2, month: 1, year: 2023},
        {day: 3, month: 1, year: 2023},
        {day: 4, month: 1, year: 2023},
        {day: 5, month: 1, year: 2023},
        {day: 6, month: 1, year: 2023},
        {day: 7, month: 1, year: 2023},
        {day: 8, month: 1, year: 2023},
        {day: 23, month: 2, year: 2023},
        {day: 8, month: 3, year: 2023},
        {day: 1, month: 5, year: 2023},
        {day: 9, month: 5, year: 2023},
        {day: 12, month: 6, year: 2023},
        {day: 4, month: 11, year: 2023},
        // перенесенные
        {day: 24, month: 2, year: 2023},
        {day: 8, month: 5, year: 2023},
    ]

    for (const date of holidays2023) {
        await addHoliday(date)
    }

    // 2
    const workingHoursApr2023 = await calculateWorkingHours({year: 2023, months: 4})

    // 3
    const workingHoursMay2023 = await calculateWorkingHours({year: 2023, months: 5})

    // 4
    const fromApr2023First = await calculateWorkingHours({year: 2023, months: [4, 12]})
    const toMar2024First = await calculateWorkingHours({year: 2024, months: [1, 3]})
    const fromApr2023ToMar2024First = fromApr2023First.workHoursCount + toMar2024First.workHoursCount

    // 5 https://www.garant.ru/calendar/buhpravo/2024
    const workWeekends2024 = [
        {day: 6, month: 1, year: 2024},
        {day: 7, month: 1, year: 2024},
        {day: 27, month: 4, year: 2024},
        {day: 2, month: 11, year: 2024},
        {day: 28, month: 12, year: 2024},
    ]

    for (const date of workWeekends2024) {
        await addWorkWeekend(date)
    }

    const holidays2024 = [
        {day: 1, month: 1, year: 2024},
        {day: 2, month: 1, year: 2024},
        {day: 3, month: 1, year: 2024},
        {day: 4, month: 1, year: 2024},
        {day: 5, month: 1, year: 2024},
        {day: 8, month: 1, year: 2024},
        {day: 23, month: 2, year: 2024},
        {day: 8, month: 3, year: 2024},
        {day: 1, month: 5, year: 2024},
        {day: 9, month: 5, year: 2024},
        {day: 12, month: 6, year: 2024},
        {day: 4, month: 11, year: 2024},
        // перенесенные
        {day: 10, month: 5, year: 2024},
        {day: 31, month: 12, year: 2024},
        {day: 29, month: 4, year: 2024},
        {day: 30, month: 4, year: 2024},
        {day: 30, month: 12, year: 2024},
    ]

    for (const date of holidays2024) {
        await addHoliday(date)
    }

    // 6
    const workingHoursApr2024First = await calculateWorkingHours({year: 2024, months: 4})

    // 7
    const workingHoursMay2024First = await calculateWorkingHours({year: 2024, months: 5})

    // 8
    const fromApr2023Second = await calculateWorkingHours({year: 2023, months: [4, 12]})
    const toMar2024Second = await calculateWorkingHours({year: 2024, months: [1, 3]})
    const fromApr2023ToMar2024Second = fromApr2023Second.workHoursCount + toMar2024Second.workHoursCount

    // 9
    await deleteHoliday({day: 29, month: 4, year: 2024})
    await deleteHoliday({day: 1, month: 5, year: 2024})

    // 10
    await addHoliday({day: 6, month: 5, year: 2024})
    await addHoliday({day: 8, month: 5, year: 2024})

    // 11
    const workingHoursApr2024Second = await calculateWorkingHours({year: 2024, months: 4})

    // 12
    const workingHoursMay2024Second = await calculateWorkingHours({year: 2024, months: 5})

    // 13
    const fromApr2023Third = await calculateWorkingHours({year: 2023, months: [4, 12]})
    const toMar2024Third = await calculateWorkingHours({year: 2024, months: [1, 3]})
    const fromApr2023ToMar2024Third = fromApr2023Third.workHoursCount + toMar2024Third.workHoursCount

    const data = {
        workingHoursApr2023,
        workingHoursMay2023,
        fromApr2023ToMar2024First,
        workingHoursApr2024First,
        workingHoursMay2024First,
        fromApr2023ToMar2024Second,
        workingHoursApr2024Second,
        workingHoursMay2024Second,
        fromApr2023ToMar2024Third,
    }

    const yamlString: string = yaml.dump(data);
    fs.writeFileSync('client-output.yaml', yamlString, 'utf8');
}

run()


async function addHoliday(holiday: CustomDate): Promise<void> {
    await fetch(
        "http://localhost:8080/holiday/add",
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(holiday)
        }
    )
}

async function deleteHoliday(holiday: CustomDate): Promise<void> {
    await fetch(
        "http://localhost:8080/holiday/delete",
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(holiday)
        }
    )
}

async function addWorkWeekend(workWeekend: CustomDate): Promise<void> {
    await fetch(
        "http://localhost:8080/working-weekend/add",
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(workWeekend)
        }
    )
}

async function calculateWorkingHours(request: WorkingHoursGetRequest): Promise<GetResponse[200]> {
    const workingHours = await fetch(
        "http://localhost:8080/working-hour/get",
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request)
        }
    )
    return await workingHours.json()
}
