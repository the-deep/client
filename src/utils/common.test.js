import { camelToNormalCase } from './common';

test('convert camelcase to normal', () => {
    expect(camelToNormalCase('ThisSOSMessage')).toEqual('This SOS Message');
    expect(camelToNormalCase('thisSOSMessage')).toEqual('this SOS Message');
    expect(camelToNormalCase('IAmDev')).toEqual('I Am Dev');
    expect(camelToNormalCase('camelCase')).toEqual('camel Case');
    expect(camelToNormalCase('CamelCase')).toEqual('Camel Case');
});
