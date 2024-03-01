type Grouped<T> = Record<string, T[]>;

export const groupBy = <T>(
  array: T[],
  getKey: (item: T) => string
): Grouped<T> => {
  return array.reduce((result: Grouped<T>, item: T) => {
    const key = getKey(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {});
};
