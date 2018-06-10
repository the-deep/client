import React from 'react';
import devLang from '#redux/initial-state/dev-lang';

import { randomString } from '#rs/utils/common';
import {
    selectedLinksSelector,
    selectedStringsSelector,
    fallbackLinksSelector,
    fallbackStringsSelector,
} from '#redux';
import store from '#store';

const stringFormat = (str, params) => {
    // TODO: Support escaping { and }

    // Regex to split the string by the templates
    const splitRegex = /({[^{}]*})/g;

    // Regex to test if a piece of string is a template or not
    // and if so capture the template key
    const testRegex = /^{([^{}]*)}$/;

    const splits = str.split(splitRegex);
    const hasReactElement = Object.values(params).find(
        p => React.isValidElement(p),
    );

    // Generate a list of {key, value} from the splits
    // replacing the templates with params.
    const results = splits.map((split) => {
        const test = testRegex.exec(split);
        if (test) {
            return {
                key: test[1],
                value: params[test[1]],
            };
        }

        return {
            key: randomString(16).toLowerCase(),
            value: split,
        };
    });

    // If params contains a react element,
    // return a react fragment with the splits separated by
    // spans.
    if (hasReactElement) {
        return (
            <React.Fragment>
                {results.map(r => (
                    <span key={r.key}>
                        {r.value}
                    </span>
                ))}
            </React.Fragment>
        );
    }

    // Otherwise, return the concatenated string.
    return results.map(r => r.value).join('');
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
