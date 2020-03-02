import {
    camelToNormalCase,
    compareTime,
    getDateWithTimezone,
    getArrayMoveDetails,
} from './common';

test('convert camelcase to normal', () => {
    expect(camelToNormalCase('ThisSOSMessage')).toEqual('This SOS Message');
    expect(camelToNormalCase('thisSOSMessage')).toEqual('this SOS Message');
    expect(camelToNormalCase('IAmDev')).toEqual('I Am Dev');
    expect(camelToNormalCase('camelCase')).toEqual('camel Case');
    expect(camelToNormalCase('CamelCase')).toEqual('Camel Case');
});

test('compare time', () => {
    expect(compareTime('12:00:00', '13:00:00')).toBeLessThan(0);
    expect(compareTime('13:00:00', '13:00:00')).toEqual(0);
    expect(compareTime('13:00:00', '12:00:00')).toBeGreaterThan(0);
});

test('get date with timezone', () => {
    expect(getDateWithTimezone('2019-05-13')).toEqual('2019-05-13+0545');
});

const oldArray = [
    'a',
    'b',
    'c',
    'd',
    'e',
];

const newArray1 = [
    'a',
    'c',
    'd',
    'b',
    'e',
];

const newArray2 = [
    'a',
    'd',
    'b',
    'c',
    'e',
];

const newArray3 = [
    'd',
    'a',
    'b',
    'c',
    'e',
];

const keySelector = d => d;

test('get array move details', () => {
    expect(getArrayMoveDetails(oldArray, newArray1, keySelector)).toEqual({
        movedData: 'b',
        afterData: 'd',
        top: false,
    });
    expect(getArrayMoveDetails(oldArray, newArray2, keySelector)).toEqual({
        movedData: 'd',
        afterData: 'a',
        top: false,
    });
    expect(getArrayMoveDetails(oldArray, newArray3, keySelector)).toEqual({
        movedData: 'd',
        afterData: undefined,
        top: true,
    });
});
