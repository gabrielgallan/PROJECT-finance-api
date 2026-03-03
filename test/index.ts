import { getLast12ClosedMonths } from "@/domain/finances/application/services/dates/date-range-service";

function test() {
    const result = getLast12ClosedMonths()

    console.log(result)
}

test()