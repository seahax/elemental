type MapKey<T> = T extends Map<infer TKey, any> ? TKey : T extends WeakMap<infer TKey, any> ? TKey : never;
type MapValue<T> = T extends Map<any, infer TValue> ? TValue : T extends WeakMap<any, infer TValue> ? TValue : never;

export function getOrInsert<TMap extends Map<any, any> | WeakMap<any, any>>(
  map: TMap,
  key: MapKey<TMap>,
  createValue: (key: MapKey<TMap>) => MapValue<TMap>,
): MapValue<TMap> {
  if (map.has(key)) return map.get(key)!;
  const value = createValue(key);
  map.set(key, value);
  return value;
}
