export function objectIsEmpty(obj: object): boolean {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return JSON.stringify(obj) === JSON.stringify({});
}

export function randomID(): string {
  return String(Math.random().toString(36).substr(2, 9));
}
