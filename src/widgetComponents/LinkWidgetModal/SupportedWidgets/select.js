import { mapToList } from '@togglecorp/fujs';

const getSelectOptions = (widgetData = {}) => (
    widgetData.options
);

const options = {
    title: 'Options',
    items: getSelectOptions,
    keySelector: d => d.key,
    labelSelector: d => d.label,
};

export default mapToList({
    options,
}, (condition, key) => ({ key, ...condition }));
