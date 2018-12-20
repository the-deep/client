import React from 'react';
import devLang from '#redux/initial-state/dev-lang.json';

import {
    selectedLinksSelector,
    selectedStringsSelector,
    fallbackLinksSelector,
    fallbackStringsSelector,
} from '#redux';
import store from '#store';

const insertBetweenItems = (lst, obj) => {
    if (lst.length <= 1) {
        return lst;
    }
    const [firstItem, ...otherItem] = lst;
    const newLst = [firstItem];

    otherItem.forEach((item) => {
        newLst.push(obj);
        newLst.push(item);
    });

    return newLst;
};

const hasReactElement = lst => lst.find(p => React.isValidElement(p));

const flatten = (lst) => {
    const newLst = [];
    lst.forEach((item) => {
        if (Array.isArray(item)) {
            newLst.push(...item);
        } else {
            newLst.push(item);
        }
    });
    return newLst;
};

// Regex to split the string by the templates
const splitRegex = /({[^{}]*})/g;

// Regex to test if a piece of string is a template or not
// and if so capture the template key
const testRegex = /^{([^{}]*)}$/;

const renderElement = r => (
    <span key={r.key}>
        {r.value}
    </span>
);

const stringFormat = (str, params) => {
    // TODO: Support escaping { and }

    const splits = str.split(splitRegex);
    // Generate a list of {key, value} from the splits
    // replacing the templates with params.
    const results = splits.map((split, index) => {
        const test = testRegex.exec(split);
        if (!test) {
            return {
                key: `${split}-${index}`,
                value: split,
            };
        }

        // NOTE: colon signifies use of list
        const indexOfColon = test[1].indexOf(':');

        if (indexOfColon === -1) {
            const key = test[1];
            return {
                key,
                value: params[key],
            };
        }

        const key = test[1].substr(0, indexOfColon);
        const concatenator = test[1].substr(indexOfColon + 1);
        const value = insertBetweenItems(params[key], concatenator);

        return value.map((v, i) => ({ key: `${key}-${i}`, value: v }));
    });

    // If params contains a react element,
    // return a react fragment with the splits separated by
    // spans.
    const withReactElement = hasReactElement(flatten(Object.values(params)));
    const flattenedResults = flatten(results);

    if (withReactElement) {
        return (
            <React.Fragment>
                {flattenedResults.map(renderElement)}
            </React.Fragment>
        );
    }
    // Otherwise, return the concatenated string.
    return flattenedResults.map(r => r.value).join('');
};

const getString = (strings, links, namespace, identifier) => {
    const namedLinkStrings = links[namespace];
    const linkName = namedLinkStrings ? namedLinkStrings[identifier] : undefined;
    return linkName ? strings[linkName] : undefined;
};

// eslint-disable-next-line no-underscore-dangle
const _ts = (namespace, identifier, params) => {
    const state = store.getState();

    const selectedStrings = selectedStringsSelector(state);
    const selectedLinks = selectedLinksSelector(state);
    let str = getString(selectedStrings, selectedLinks, namespace, identifier);

    // If string is not in selected language, get from fallback language
    if (!str) {
        const fallbackStrings = fallbackStringsSelector(state);
        const fallbackLinks = fallbackLinksSelector(state);
        str = getString(fallbackStrings, fallbackLinks, namespace, identifier);
    }
    // If string is not in fallback language, get from dev language
    if (!str) {
        str = getString(devLang.strings, devLang.links, namespace, identifier);
    }
    // If string is not in dev language, show identifiers
    if (!str) {
        str = `{${namespace}:${identifier}}`;
    } else if (params) {
        str = stringFormat(str, params);
    }
    return str;
};

export default _ts;
