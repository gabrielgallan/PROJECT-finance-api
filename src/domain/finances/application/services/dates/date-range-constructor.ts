import { DateInterval } from '@/core/types/repositories/date-interval'
import dayjs from 'dayjs'

export interface GetLastTwelveMonthsResponse {
  months: {
    month: number
    year: number
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
}