import { mapToList } from '@togglecorp/fujs';

const orgChildSelector = d => d.organs;
const orgLabelSelector = d => d.title;
const orgIdSelector = d => d.key;

const emptyArray = [];

const getOptionsForSelect = (params) => {
    const {
        options,
        idSelector,
        labelSelector,
        childSelector,
        prefix = '',
    } = params;

    if (!options || options.length === 0) {
        return emptyArray;
    }

    return options.reduce((selections, d) => [
        {
            key: idSelector(d),
            title: `${prefix}${labelSelector(d)}`,
        },
        ...selections,
        ...getOptionsForSelect({
            options: childSelector(d),
            idSelector,
            labelSelector,
            childSelector,
            prefix: `${prefix}${labelSelector(d)} / `,
        }),
    ], []);
};

const getOptions = widgetData => (
    widgetData && getOptionsForSelect({
        options: [widgetData],
        idSelector: orgIdSelector,
        labelSelector: orgLabelSelector,
        childSelector: orgChildSelector,
    })
);

const options = {
    title: 'options',
    items: getOptions,
    keySelector: d => d.key,
    labelSelector: d => d.title,
};

export default mapToList({
    options,
}, (condition, key) => ({ key, ...condition }));
