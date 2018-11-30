export default (
    tester,
    { values = [], testEvery } = {},
) => (values && Array.isArray(values) ? (
    values[testEvery ? 'every' : 'some'](tester)
) : false);
