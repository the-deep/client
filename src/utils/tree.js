import {
    isDefined,
    isNotDefined,
    mapToList,
    union,
} from '@togglecorp/fujs';


const difference = (setA, setB) => (
    new Set([...setA].filter(x => !setB.has(x)))
);

export const unflat = (nodes, memory = {}, idSelector, parentSelector) => {
    const mem = memory;
    if (nodes.length <= 0) {
        return mem;
    }

    const [firstItem, ...otherItems] = nodes;
    const id = idSelector(firstItem);
    const parent = parentSelector(firstItem);
    const { $flagged } = firstItem;
    if (isNotDefined(parent)) {
        mem[id] = { ...firstItem, children: [] };
        return unflat(otherItems, mem, idSelector, parentSelector);
    } else if (!mem[parent]) {
        return unflat(
            !$flagged ? [...otherItems, { ...firstItem, $flagged: true }] : otherItems,
            mem,
            idSelector,
            parentSelector,
        );
    }
    mem[id] = { ...firstItem, children: [] };
    mem[parent].children.push(mem[id]);
    return unflat(otherItems, mem, idSelector, parentSelector);
};

export const unflatten = (nodes, idSelector, parentSelector) => {
    const value = unflat(nodes, {}, idSelector, parentSelector);
    const valueList = mapToList(
        value,
        val => val,
    );
    return valueList.filter(val => isNotDefined(parentSelector(val)));
};

// idSelector: a => a.key
// parentSelector: a => a.parent
export const getParents = (keys, optionsMap, idSelector, parentSelector) => {
    if (keys.size <= 0) {
        return new Set();
    }

    const items = [...keys]
        .map(key => optionsMap[key])
        .filter(isDefined);

    const validKeys = new Set(
        items.map(idSelector),
    );

    const parentKeys = new Set(
        items.map(parentSelector).filter(isDefined),
    );

    const trueParentKeys = difference(
        parentKeys,
        validKeys,
    );

    return union(validKeys, getParents(trueParentKeys, optionsMap, idSelector, parentSelector));
};

// idSelector: a => a.key
// childrenSelector: a => a.children
export const getChildren = (keys, tree, idSelector, childrenSelector) => {
    let set = new Set();
    keys.forEach((key) => {
        // don't need to add child again or child's children
        if (set.has(key)) {
            return;
        }

        const value = tree[key];
        if (!value) {
            return;
        }
        set.add(key);
        const children = childrenSelector(value);
        if (children && children.length >= 0) {
            const childrenKeys = new Set(children.map(idSelector));
            const allChildren = getChildren(childrenKeys, tree, idSelector, childrenSelector);
            set = union(set, allChildren);
        }
    });
    return set;
};
