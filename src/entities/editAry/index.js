const widgetSpecificProps = {
    number: {
        separator: ' ',
    },
};

const getOptions = (sourceType, sources, options) => {
    switch (sourceType) {
        case 'countries':
            return sources.countries;
        case 'organizations':
            return sources.organizations;
        default:
            return options;
    }
};

export const getProps = (data, sources) => {
    const {
        fieldType,
        id: key,
        options,
        placeholder,
        title,
        tooltip,
        sourceType,
    } = data;

    const id = String(key);
    const commonProps = {
        faramElementName: id,
        key: id,
        label: title,
        options: getOptions(sourceType, sources, options),
        placeholder,
        title: tooltip,
    };

    const specificProps = widgetSpecificProps[fieldType];

    return {
        ...commonProps,
        ...specificProps,
    };
};

export const isDroppableWidget = (sourceType, fieldType) => (
    sourceType === 'organizations' && fieldType === 'multiselect'
);
