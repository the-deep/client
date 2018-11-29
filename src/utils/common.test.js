import {
    camelToNormalCase,
    compareTime,
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
