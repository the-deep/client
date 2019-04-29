// eslint-disable-next-line import/prefer-default-export
export function generateRelation(options, idSelector, parentSelector) {
    const acc = {};

    options.forEach((node) => {
        // NOTE: item in acc
        const id = idSelector(node);

        const elem = acc[id];
        if (elem) {
            acc[id] = {
                ...elem,
                ...node,
            };
        } else {
            acc[id] = {
                ...node,
                children: {},
            };
        }

        // Iterate over all parents
        let parentId = parentSelector(node);
        while (parentId) {
            let parent = acc[parentId];

            // Create a placeholder parent if there is none
            if (!parent) {
                parent = {
                    children: {
                        ...acc[id].children,
                        [id]: id,
                    },
                };
                acc[parentId] = parent;
            } else {
                parent.children = {
                    ...parent.children,
                    ...acc[id].children,
                    [id]: id,
                };
            }

            parentId = parentSelector(parent);
        }
    });
    // TODO: check for placeholder parent
    return acc;
}

export function simpleShuffle(options) {
    if (!options || options.length <= 1) {
        return options;
    }
    const newOptions = [...options];
    const len = newOptions.length;
    for (let i = 0; i < len; i += 1) {
        const randIndex = Math.floor(Math.random() * len);
        const tmp = newOptions[i];
        newOptions[i] = newOptions[randIndex];
        newOptions[randIndex] = tmp;
    }
    return newOptions;
}
