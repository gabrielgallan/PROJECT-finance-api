import { ValueObject } from '@/core/entities/value-object'
import { WalletSummary } from './wallet-summary'

export interface MonthSummaryProps {
    year: number
    monthIndex: number
    summary: WalletSummary
}

export interface YearWalletSummaryProps {
    yearSummary: WalletSummary
    monthSummaries: MonthSummaryProps[]
}

export class YearWalletSummary extends ValueObject<YearWalletSummaryProps> {
    static create(
        props: YearWalletSummaryProps,
    ) {
        return new YearWalletSummary(props)
    }

    get yearSummary() {
        return this.props.yearSummary
    }

    get monthSummaries() {
        return this.props.monthSummaries
    }
}