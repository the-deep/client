import { removeEmptyObject, removeUndefinedKeys } from './unsafeCommon';

test('remove empty object', () => {
  const emptyArray = [];
  expect(removeEmptyObject(emptyArray)).not.toBe(emptyArray);
  expect(removeEmptyObject(emptyArray)).toStrictEqual(emptyArray);

  expect(removeEmptyObject({})).toBe(undefined);

  expect(removeEmptyObject(1)).toBe(1);
  expect(removeEmptyObject('hari')).toBe('hari');

  expect(removeEmptyObject({
    name: 'hari',
    properties: {},
    location: {
      name: 'ayodhya',
      codes: [],
      meta: {},
    },
    transaction: {
      meta: {},
    },
    orders: {
      id: undefined,
      time: undefined,
    },
    places: {
      id: undefined,
      alternatives: {},
    },
    logs: [{}, { id: '12' }],
  })).toStrictEqual({
    name: 'hari',
    properties: undefined,
    location: {
      name: 'ayodhya',
      codes: [],
      meta: undefined,
    },
    transaction: undefined,
    orders: undefined,
    places: undefined,
    logs: [undefined, { id: '12' }],
  });
});

test('remove undefined keys', () => {
  const emptyArray = [];
  expect(removeUndefinedKeys(emptyArray)).not.toBe(emptyArray);
  expect(removeUndefinedKeys(emptyArray)).toStrictEqual(emptyArray);

  const emptyObject = {};
  expect(removeUndefinedKeys(emptyArray)).not.toBe(emptyObject);
  expect(removeUndefinedKeys(emptyObject)).toStrictEqual(emptyObject);

  expect(removeUndefinedKeys(1)).toBe(1);
  expect(removeUndefinedKeys('hari')).toBe('hari');

  expect(removeUndefinedKeys({
    name: 'hari',
    properties: undefined,
    location: {
      name: 'ayodhya',
      codes: [],
      meta: undefined,
    },
    transaction: undefined,
    orders: undefined,
    places: undefined,
    logs: [undefined, { id: '12' }],
  })).toStrictEqual({
    name: 'hari',
    location: {
      name: 'ayodhya',
      codes: [],
    },
    logs: [undefined, { id: '12' }],
  });
});
