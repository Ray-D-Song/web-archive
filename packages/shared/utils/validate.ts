export function isNil(value: any): value is null | undefined {
  return value === null || value === undefined
}

export function isNotNil<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined
}

export function isNumberString(value: any): value is string {
  return isNotNil(value) && !Number.isNaN(Number(value))
}
