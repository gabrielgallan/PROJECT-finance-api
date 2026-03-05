import { Transaction } from "../../enterprise/entities/transaction"

type CalculateTransactionsTotalsInput = {
  transactions: Transaction[]
}

type CalculateTransactionsTotalsOutput = {
  incomeTransactions: Transaction[]
  totalIncome: number
  expenseTransactions: Transaction[]
  totalExpense: number
}

export function calculateTransactionsTotals({
  transactions,
}: CalculateTransactionsTotalsInput): CalculateTransactionsTotalsOutput {
  const result = transactions.reduce<CalculateTransactionsTotalsOutput>(
    (acc, tx) => {
      if (tx.isIncome()) {
        acc.incomeTransactions.push(tx)
        acc.totalIncome += tx.amount.toNumber()
      } else {
        acc.expenseTransactions.push(tx)
        acc.totalExpense += tx.amount.toNumber()
      }

      return acc
    },
    {
      incomeTransactions: [],
      totalIncome: 0,
      expenseTransactions: [],
      totalExpense: 0,
    }
  )

  return result
}
