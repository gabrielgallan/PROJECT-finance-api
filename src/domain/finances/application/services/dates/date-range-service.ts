import { DateInterval } from '@/core/types/repositories/date-interval'
import dayjs from 'dayjs'

export interface Response {
  month: number
  year: number
  interval: DateInterval
}

export function getLast12ClosedMonths(): Response[] {
  const results: Response[] = []

  const currentMonthStart = dayjs().startOf('month')
  const currentMonthEnd = dayjs().endOf('month')

  for (let i = 0; i <= 12; i++) {
    const start = currentMonthStart.subtract(i, 'month')
    const end = currentMonthEnd.subtract(i, 'month')

    results.push({
      month: start.month(), // index 0–11
      year: start.year(),
      interval: {
        startDate: start.toDate(),
        endDate: end.toDate(),
      },
    })
  }

  return results
}