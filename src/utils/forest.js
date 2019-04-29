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
                children: [],
            };
        }

        // Iterate over all parents
        let parentId = parentSelector(node);
        while (parentId) {
            let parent = acc[parentId];

            // Create a placeholder parent if there is none
            if (!parent) {
                // parent = { id: parentId, fake: true, children: [node.id] };
                parent = { children: [id, ...acc[id].children].sort((a, b) => a - b) };
                acc[parentId] = parent;
            } else {
                parent.children = [...parent.children, id, ...acc[id].children].sort((a, b) => a - b);
            }

            parentId = parentSelector(parent);
        }
    });
    // TODO: check for placeholder parent
    return acc;
}

export function simpleShuffle(options, n) {
    if (!options || options.length <= 1) {
        return options;
    }
    const newOptions = [...options];
    const len = newOptions.length;
    const iteration = n === undefined
        ? 2 * len
        : n;
    for (let i = 0; i < iteration; i += 1) {
        const randIndex = Math.floor(Math.random() * len);
        const tmp = newOptions[0];
        newOptions[0] = newOptions[randIndex];
        newOptions[randIndex] = tmp;
    }
    return newOptions;
}
