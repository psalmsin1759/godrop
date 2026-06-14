/**
 * Conversion helpers for the Kobo (DB/internal) <-> Naira (API contract) boundary.
 * The database keeps storing integer Kobo; validators and response shaping
 * convert at the edges so the HTTP contract only ever deals in Naira.
 */

export function toNaira(kobo: number): number {
  return Math.round(kobo) / 100;
}

export function toKobo(naira: number): number {
  return Math.round(naira * 100);
}

/**
 * Converts `<field>Kobo` properties on an object to `<field>` Naira values,
 * removing the original `Kobo`-suffixed keys.
 */
export function serializeMoney<T extends Record<string, any>>(obj: T, fields: string[]): any {
  const result: any = { ...obj };
  for (const field of fields) {
    const koboKey = `${field}Kobo`;
    if (koboKey in result) {
      result[field] = toNaira(result[koboKey]);
      delete result[koboKey];
    }
  }
  return result;
}

export function serializeMoneyList<T extends Record<string, any>>(list: T[], fields: string[]): any[] {
  return list.map((item) => serializeMoney(item, fields));
}
