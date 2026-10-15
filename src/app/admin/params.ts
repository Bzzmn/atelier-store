/** One value of a search param: the first if repeated, trimmed and capped. */
export function firstParam(value: string | string[] | undefined, max = 100) {
  return (Array.isArray(value) ? value[0] : value)?.trim().slice(0, max) ?? "";
}
