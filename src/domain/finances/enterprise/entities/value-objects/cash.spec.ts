import { Cash } from "./cash"

describe("Cash tests", () => {
    it("should create a Cash instance from amount", () => {
        const cash = Cash.fromAmount(50.993498548795)
        expect(cash.toNumber()).toBeCloseTo(50.99, 2)
    })

    it("should create a Cash instance from cents", () => {
        const cash = Cash.fromCents(5099)
        expect(cash.toCents()).toBe(5099)
    })

    it("should add two Cash instances", () => {
        const cash1 = Cash.fromAmount(50.99)
        const cash2 = Cash.fromCents(2045)

        const sumResult = cash1.add(cash2)
        const subtractResult = cash1.subtract(cash2)

        expect(sumResult.toNumber()).toBeCloseTo(71.44, 2)
        expect(subtractResult.toNumber()).toBeCloseTo(30.54, 2)
    })
})