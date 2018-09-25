import memoize from 'memoize-one';

const emptyObject = {};

const getOptionsForSelect = (params) => {
    const {
        data,
        idSelector,
        labelSelector,
        childSelector,
        prefix = '',
        parents = [],
    } = params;

    if (!data || data.length === 0) {
        return [];
    }
    return data.reduce((options, d) => [
        {
            id: idSelector(d),
            name: `${prefix}${labelSelector(d)}`,
            parents,
        },
        ...options,
        ...getOptionsForSelect({
            data: childSelector(d),
            idSelector,
            labelSelector,
            childSelector,
            prefix: `${prefix}${labelSelector(d)} / `,
            parents: [...parents, idSelector(d)],
        }),
    ], []);
};

const getOrganigramOptions = memoize(widgetData => (
    getOptionsForSelect({
        data: [widgetData],
        idSelector: d => d.key,
        labelSelector: d => d.title,
        childSelector: d => d.organs,
    })
));

const isEqualTo = {
    title: 'Is equal to',
    attributes: [{
        key: 'selection',
        type: 'select',
        title: 'Value',
        options: getOrganigramOptions,
        keySelector: d => d.id,
        labelSelector: d => d.name,
    }],
    test: ({ value = [] }, { selection }) => (
        value.some(v => (v === selection))
    ),
};

const isDescendentOf = {
    title: 'has descendent of',
    attributes: [{
        key: 'selection',
        type: 'select',
        title: 'has descendent of',
        options: getOrganigramOptions,
        keySelector: d => d.id,
        labelSelector: d => d.name,
    }],
    test: ({ value = [] }, { selection }, widgetData) => (
        value.some((v) => {
            const { parents = [] } = getOrganigramOptions(widgetData)
                .find(o => o.id === v) ||
                emptyObject;
            return parents.indexOf(selection) >= 0;
        })
    ),
};

export default {
    isEqualTo,
    isDescendentOf,
};
