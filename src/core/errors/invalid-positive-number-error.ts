export class InvalidPositiveNumberError extends Error {
  constructor() {
    super('Invalid positive number. Must be greater than 0')
  }
}