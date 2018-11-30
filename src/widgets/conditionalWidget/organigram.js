import memoize from 'memoize-one';
import { isFalsy } from '#rsu/common';
import testMultiSelect from './testMultiSelect';

const emptyObject = {};
const emptyArray = [];

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

const getOrganigramOptions = memoize((widgetData) => {
    if (isFalsy(widgetData)) {
        return emptyArray;
    }

    return getOptionsForSelect({
        data: [widgetData],
        idSelector: d => d.key,
        labelSelector: d => d.title,
        childSelector: d => d.organs,
    });
});

const isEqualTo = {
    title: 'Is equal to',
    attributes: [{
        key: 'selections',
        type: 'multiselect',
        title: 'Value',
        options: getOrganigramOptions,
        keySelector: d => d.id,
        labelSelector: d => d.name,
    }],
    test: ({ value = [] }, { selections }) => testMultiSelect(
        selection => value.some(v => (v === selection)),
        selections,
    ),
};

const isDescendentOf = {
    title: 'has descendent of',
    attributes: [{
        key: 'selections',
        type: 'multiselect',
        title: 'has descendent of',
        options: getOrganigramOptions,
        keySelector: d => d.id,
        labelSelector: d => d.name,
    }],
    test: ({ value = [] }, { selections }, widgetData) => testMultiSelect(
        selection =>
            value.some((v) => {
                const { parents = [] } = getOrganigramOptions(widgetData)
                    .find(o => o.id === v) ||
                    emptyObject;
                return parents.indexOf(selection) >= 0;
            }),
        selections,
    ),
};

export default {
    isEqualTo,
    isDescendentOf,
};
