import React from 'react';
import { isDefined, isNotDefined } from '@togglecorp/fujs';
import devLang from '../src/redux/initial-state/dev-lang.json';

function insertBetweenItems<T, Q>(list: T[] | undefined, obj: Q) {
    if (isNotDefined(list)) {
        return [];
    }
    if (list.length <= 1) {
        return list;
    }
    const [firstItem, ...otherItem] = list;

    const newList: (T | Q)[] = [firstItem];
    otherItem.forEach((item) => {
        newList.push(obj);
        newList.push(item);
    });

    return newList;
}

// eslint-disable-next-line @typescript/eslint-no-explicit-any
function hasReactElement(list: any[]): boolean {
    return isDefined(list.find((p) => React.isValidElement(p)));
}

// Regex to split the string by the templates
const splitRegex = /({[^{}]*})/g;

// Regex to test if a piece of string is a template or not
// and if so capture the template key
const testRegex = /^{([^{}]*)}$/;

interface KeyValue<T> {
    key: string;
    value: T;
}
function renderElement<T>(r: KeyValue<T>) {
    return (
        <span key={r.key}>
            {r.value}
        </span>
    );
}

function format(
    str: string,
    params: Record<string, string | string[] | number | React.ReactNode>,
) {
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
        const value = insertBetweenItems(params[key] as unknown[], concatenator);

        return value.map((v, i) => ({ key: `${key}-${i}`, value: v }));
    });

    // If params contains a react element,
    // return a react fragment with the splits separated by
    // spans.
    const flattenedResults = results.flat();

    const withReactElement = hasReactElement(Object.values(params).flat());

    if (withReactElement) {
        return (
            <>
                {flattenedResults.map(renderElement)}
            </>
        );
    }
    // Otherwise, return the concatenated string.
    return flattenedResults.map((r) => r.value).join('');
}

const getString = (
    strings: Record<string, string>,
    links: Record<string, Record<string, number>>,
    namespace: keyof DevLang['links'],
    identifier: string,
) => {
    const namedLinkStrings = links[namespace];
    const linkName = namedLinkStrings ? namedLinkStrings[identifier] : undefined;
    return linkName ? strings[linkName] : undefined;
};

type DevLang = typeof devLang;

// eslint-disable-next-line no-underscore-dangle
function _ts(namespace: keyof DevLang['links'], identifier: string, params: Record<string, string>) {
    const str = getString(devLang.strings, devLang.links, namespace, identifier);
    // If string is not in dev language, show identifiers
    if (!str) {
        return `{${namespace}:${identifier}}`;
    }
    if (params) {
        return format(str, params);
    }
    return str;
}

export default _ts;
