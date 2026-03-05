export class Cash {
    private constructor(private readonly cents: number) { }

    static fromAmount(amount: number) {
        return new Cash(Math.round(amount * 100))
    }

    static fromCents(cents: number) {
        return new Cash(cents)
    }

    toNumber() {
        return this.cents / 100
    }

    toCents() {
        return this.cents
    }

    add(other: Cash) {
        return new Cash(this.cents + other.cents)
    }

    subtract(other: Cash) {
        return new Cash(this.cents - other.cents)
    }
}