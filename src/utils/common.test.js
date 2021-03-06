import {
    camelToNormalCase,
    compareTime,
    getDateWithTimezone,
    trimFileExtension,
    getArrayMoveDetails,
    getTitleFromUrl,
    isUrlValid,
    capitalizeOnlyFirstLetter,
    formatTitle,
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

test('trim file extension', () => {
    expect(trimFileExtension('test_123_22.pdf')).toEqual('test_123_22');
    expect(trimFileExtension('test_123_22.docx')).toEqual('test_123_22');
    expect(trimFileExtension('test_123_22.geo.json')).toEqual('test_123_22');
    expect(trimFileExtension('abc def')).toEqual('abc def');
    expect(trimFileExtension('abcdef.geojson')).toEqual('abcdef.geojson');
});

test('format title for file', () => {
    expect(formatTitle('test_123_22.pdf')).toEqual('test 123 22');
    expect(formatTitle('test-123_22.docx')).toEqual('test 123 22');
    expect(formatTitle('test_123-22.geo.json')).toEqual('test 123-22');
    expect(formatTitle('abc def')).toEqual('abc def');
    expect(formatTitle('[Patrick-Meier]-2012-10-12-Digital_2012-10-12_humanitarians-_-how-big-da(z-lib.org).pdf'))
        .toEqual('[Patrick Meier] 2012-10-12 Digital 2012-10-12 humanitarians - how big da(z lib.org)');
});

test('is url valid', () => {
    expect(isUrlValid('https://reliefweb.int/report/democratic-republic-congo/un-emergency-funding-released-support-ebola-response-democratic'))
        .toEqual(true);
    expect(isUrlValid('/report/democratic-republic-congo/un-emergency-funding-released-support-ebola-response-democratic'))
        .toEqual(false);
});

test('get title from url', () => {
    expect(getTitleFromUrl('https://reliefweb.int/report/democratic-republic-congo/un-emergency-funding-released-support-ebola-response-democratic'))
        .toEqual('un emergency funding released support ebola response democratic');
    expect(getTitleFromUrl('https://reliefweb.int/sites/reliefweb.int/files/resources/DTM_Update-TarhunaSirt_2020-06-07.pdf'))
        .toEqual('DTM Update TarhunaSirt 2020-06-07');
    expect(getTitleFromUrl('/sites/reliefweb.int/files/resources/DTM_Update-TarhunaSirt_2020-06-07.pdf'))
        .toEqual(undefined);
});

test('capitalize only first letter', () => {
    expect(capitalizeOnlyFirstLetter('un response democratic'))
        .toEqual('Un response democratic');
    expect(capitalizeOnlyFirstLetter('un RESPONSE democratic'))
        .toEqual('Un response democratic');
    expect(capitalizeOnlyFirstLetter('[response] democratic'))
        .toEqual('[Response] democratic');
    expect(capitalizeOnlyFirstLetter('12 people Missing'))
        .toEqual('12 People missing');
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
