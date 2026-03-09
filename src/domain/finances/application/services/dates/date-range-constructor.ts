import { DateInterval } from '@/core/types/repositories/date-interval'
import dayjs from 'dayjs'

export interface GetLastTwelveMonthsResponse {
  months: {
    month: number
    year: number
    interval: DateInterval
  }[]
}

export interface GetCurrentMonthWeeksResponse {
  month: number
  year: number
  weeks: {
    week: number
    interval: DateInterval
  }[]
}

export class DateRangeConstructor {
  static getLastTwelveMonths(): GetLastTwelveMonthsResponse {
    const months: GetLastTwelveMonthsResponse['months'] = []

    const currentMonthStart = dayjs().startOf('month')

    for (let i = 11; i >= 0; i--) {
      const start = currentMonthStart.subtract(i, 'month')
      const end = start.add(1, 'month')

      months.push({
        month: start.month(), // 0–11 (Jan = 0)
        year: start.year(),
        interval: {
          startDate: start.toDate(),
          endDate: end.toDate(),
        },
      })
    }

    return { months }
  }

  static getCurrentMonthWeeks(): GetCurrentMonthWeeksResponse {
    const weeks: GetCurrentMonthWeeksResponse['weeks'] = []

    const startOfMonth = dayjs().startOf('month')
    const startOfNextMonth = startOfMonth.add(1, 'month')

    let currentStart = startOfMonth
    let week = 1

    while (currentStart.isBefore(startOfNextMonth)) {
      const nextStart = currentStart.add(7, 'day')

      weeks.push({
        week,
        interval: {
          startDate: currentStart.toDate(),
          endDate: nextStart.isAfter(startOfNextMonth)
            ? startOfNextMonth.toDate()
            : nextStart.toDate(),
        },
      })

      currentStart = nextStart
      week++
    }

    return {
      month: startOfMonth.month(),
      year: startOfMonth.year(),
      weeks,
    }
  }
}